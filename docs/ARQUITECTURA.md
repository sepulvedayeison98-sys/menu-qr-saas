# Arquitectura — Plataforma SaaS de Menús Digitales QR

> Documento de diseño. Stack de entrega: **HTML estático premium**. Control plane multi-tenant separado.
> Caso base: restaurante **LA BURGUESÍA**.

## Objetivo

Construir una plataforma **multi-tenant** que venda menús digitales como servicio por
suscripción. Cada restaurante obtiene un menú **ultra-rápido (<3s)** accesible por QR, con su
propia marca y subdominio, mientras se opera todo desde un **control plane** centralizado.
El QR nunca cambia aunque el menú sí.

Decisión clave: **separar el plano de entrega (rápido, cacheado, barato) del plano de control
(dinámico, seguro, con datos)**. Es lo que permite que un servidor pequeño aguante cientos de
restaurantes.

---

## Arquitectura (alto nivel)

```
                          ┌─────────────────────────────────┐
   Cliente escanea QR ──► │   CDN EDGE (Cloudflare/Vercel)   │  ◄── 95% del tráfico
   {slug}.lamenu.app      │   Menú HTML cacheado (<3s)        │      vive aquí, casi $0
                          └───────────────┬─────────────────┘
                                          │ cache miss / purge
                                          ▼
   ┌──────────────────────────────────────────────────────────────────────┐
   │                      PLANO DE CONTROL (backend)                         │
   │                                                                          │
   │   admin.lamenu.app          API / Edge Functions        Webhooks         │
   │   (panel React)      ◄────►  (auth, CRUD, QR, billing) ◄──► Stripe/Wompi  │
   │                                          │                               │
   │                                          ▼                               │
   │              ┌──────────── Supabase (Postgres) ───────────┐             │
   │              │  RLS por tenant_id · Auth · Storage (imgs)  │             │
   │              └─────────────────────────────────────────────┘             │
   │                                          │                               │
   │              Raw events ──► Agregación ──► Marts (dashboards)            │
   └──────────────────────────────────────────────────────────────────────┘
```

**Dos planos, una sola fuente de verdad (Postgres):**

- **Entrega (Delivery):** el menú se renderiza en el edge y se cachea agresivamente. Al editar
  un precio se **purga el caché** de ese restaurante (`stale-while-revalidate`). Resultado:
  velocidad de sitio estático + actualización instantánea. Resuelve "el QR sigue funcional
  aunque cambien productos/precios".
- **Control:** todo lo dinámico (login, edición, QR, analíticas, cobros) vive aislado, sin
  afectar la velocidad del menú.

---

## Modelo multi-tenant

**Estrategia: base de datos compartida + Row Level Security (RLS).** Una sola Postgres con
`tenant_id` en cada tabla y políticas que garantizan que un restaurante jamás vea datos de otro.
Evita el costo de una DB por cliente hasta tener cientos de tenants.

**Resolución de subdominios:** DNS wildcard (`*.lamenu.app`) → el edge lee el `slug` del host →
carga el menú correcto. Soporta dominios propios (plan premium): `menu.elrestaurante.com` → tenant.

```
Esquema de datos (capas: Raw → Mart)

tenants        (id, slug, nombre, plan, estado, created_at)
users          (id, tenant_id, email, rol)                 # owner / staff
restaurants    (id, tenant_id, slug, nombre,
                brand_json {colores, logo_url, fuente},
                contacto, horarios, redes, ubicacion)
categories     (id, restaurant_id, nombre, orden)
products       (id, category_id, nombre, descripcion, precio,
                imagen_url, es_popular, recomendado_chef, activo, orden)
promotions     (id, restaurant_id, titulo, vigencia, productos[])
qr_codes       (id, restaurant_id, target_url FIJA, estilo_json, version)
subscriptions  (id, tenant_id, proveedor, plan, estado, periodo_fin)

-- Analíticas: Raw → Agregado
scan_events    (id, restaurant_id, ts, device, referer)        # cada escaneo
view_events    (id, restaurant_id, target_type, target_id, ts) # producto/categoría vista
mart_daily     (restaurant_id, fecha, escaneos, top_productos, top_categorias, hora_pico)
```

---

## Módulos

| Módulo | Responsabilidad | Stack sugerido |
|---|---|---|
| **Menú (Delivery)** | Render por subdominio, mobile-first, navegación por categorías, beacon de analíticas | **Astro** (SSG/SSR híbrido) o Next.js ISR, en Cloudflare Pages/Vercel |
| **Panel Admin** | Login, CRUD productos/categorías/promos, branding, descarga de QR, dashboards | React + Vite (SPA) o Next.js |
| **API / Auth** | Reglas de negocio, RLS, validación, purga de caché al guardar | Supabase Edge Functions / Postgres |
| **QR Service** | Genera QR → URL fija; exporta PNG/SVG/PDF con logo y colores | `qr-code-styling` (SVG) + `sharp`/`pdf-lib` |
| **Analytics** | Ingesta de escaneos/vistas, agregación a marts, KPIs | Tabla events + cron SQL, o Umami self-host |
| **Billing** | Suscripciones mensuales, estados, cortes | **Stripe** o **Wompi/MercadoPago** (Colombia, COP) |
| **Provisioning** | Crear tenant → genera slug, QR y subdominio **automáticamente** | Función `createTenant()` transaccional |

**Flujo de QR (clave):** el QR se genera UNA vez apuntando a `https://{slug}.lamenu.app` y esa URL
**nunca cambia**. La personalización (logo, color) afecta solo la *imagen* del QR, no su destino.
Por eso se puede reimprimir el diseño sin invalidar QRs ya impresos en mesas o facturas.

**Flujo de alta automática (vender la plantilla):**

```
Trigger: nuevo restaurante en admin
  → crea tenant + restaurant (slug único)
  → genera qr_code (target_url fija) + assets PNG/SVG/PDF
  → activa subdominio (wildcard, cero config DNS)
  → siembra categorías base + datos demo
  → Output: menú vivo + QR descargable, sin tocar código
```

---

## KPIs y dashboards (analíticas)

Definiendo **KPIs primero**, luego las métricas que los alimentan:

- **Vista ejecutiva (dueño):** escaneos hoy/semana, tendencia, producto estrella, hora pico.
- **Vista táctica:** top 10 productos vistos, categorías más navegadas, conversión vista→tiempo.
- **Vista operativa:** log de escaneos por origen (QR de mesa vs. redes vs. factura con `?src=`).

Truco de bajo costo: distintos QR con `?src=mesa|redes|factura` dan atribución de canal sin
infraestructura extra.

---

## Mejoras propuestas

1. **Modo offline del menú** — con un Service Worker, el menú queda cacheado en el celular del
   cliente; si el WiFi del local es malo, igual carga al instante.
2. **QR por mesa con `?mesa=N`** — habilita más adelante pedidos/llamar al mesero sin rediseñar.
3. **Plantillas de marca pre-hechas** (steakhouse, gastrobar, fast-casual) — arrancar un cliente
   nuevo en minutos cambiando solo logo/colores/menú.

---

## Alertas / Riesgos

- **Imágenes = mayor riesgo de rendimiento.** Obligatorio WebP/AVIF + lazy loading + CDN de
  imágenes. Sin esto, Lighthouse 95+ es imposible.
- **Pagos en Colombia:** Stripe no cobra COP nativamente. Para suscripciones reales usar
  **Wompi, MercadoPago o PayU**. Decidir temprano: cambia el módulo de billing.
- **Aislamiento multi-tenant:** RLS mal configurada = fuga de datos entre restaurantes. Riesgo
  #1 de seguridad; requiere tests de aislamiento.
- **Purga de caché:** si el webhook "guardar → purgar CDN" falla, el precio no se refleja.
  Necesita reintentos + botón manual "republicar".
- **Costo de analíticas:** agregar a `mart_daily` con cron y borrar raw > 90 días.

---

## Roadmap por fases

- **Fase 1 — MVP vendible:** menú estático premium (LA BURGUESÍA) + QR descargable + branding por config.
- **Fase 2 — Control plane:** Supabase + auth + panel admin CRUD + multi-tenant con RLS.
- **Fase 3 — Monetización:** billing (Wompi) + alta automática de tenants + subdominios.
- **Fase 4 — Inteligencia:** analíticas, dashboards, modo offline, temas de marca.

---

## Oportunidades detectadas

- El menú de LA BURGUESÍA ya tiene etiquetas implícitas de venta (combos, "Big Animal",
  recomendados) → modelarlas como `es_popular`/`recomendado_chef` desde el día 1.
- Precios en COP con miles (`$35.000`) → guardar como entero y formatear en el render.
- Categorías muy claras (Hamburguesas, Cortes, Mexicana, Bebidas) → caso de datos limpio ideal
  para validar el esquema.
