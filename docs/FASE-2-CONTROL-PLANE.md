# Fase 2 — Control Plane (backend, auth, API)

Implementación del plano de control sobre **Supabase (Postgres + Auth + Storage)**.
El esquema y las políticas RLS viven en [`db/schema.sql`](../db/schema.sql); el seed de
ejemplo en [`db/seed_example.sql`](../db/seed_example.sql).

## Identidad y aislamiento

- Auth con Supabase (email/password o magic link). Cada `auth.users` → un `profiles`
  con `tenant_id` y `rol` (`owner` | `staff`).
- **Todo el aislamiento lo hace la base**, no el código: las políticas RLS comparan contra
  `current_tenant_id()`. Aunque un endpoint tenga un bug, Postgres no devuelve datos de otro tenant.
- Dos claves Supabase:
  - **anon key** → cliente/admin, sujeta a RLS.
  - **service role key** → solo backend (entrega del menú e ingesta de analítica). **Nunca** en el navegador.

## Endpoints (API)

Convención: `admin.*` requiere sesión (RLS aplica). `public.*` es sin auth, vía service role.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/admin/restaurants` | owner | Crear/editar restaurante y marca |
| GET/POST/PATCH/DELETE | `/admin/categories` | owner/staff | CRUD categorías |
| GET/POST/PATCH/DELETE | `/admin/products` | owner/staff | CRUD productos |
| POST | `/admin/promotions` | owner/staff | Gestión de promociones |
| POST | `/admin/media/upload` | owner/staff | Subir imagen → Storage (devuelve URL) |
| GET | `/admin/qr` | owner | Config del QR (URL fija + estilo) |
| GET | `/admin/qr/export?fmt=png\|svg\|pdf` | owner | Descargar QR renderizado |
| GET | `/admin/analytics/summary` | owner | KPIs (escaneos, top, hora pico) |
| POST | `/admin/tenants` | super-admin | **Provisioning** de un nuevo restaurante |
| GET | `/public/menu/:slug` | — (service role) | JSON del menú para el edge |
| POST | `/public/events/scan` | — | Registrar escaneo (`{slug, src, device}`) |
| POST | `/public/events/view` | — | Registrar vista (`{slug, type, id}`) |
| POST | `/webhooks/billing` | firma | Estado de suscripción (Wompi/MercadoPago) |

## Flujo de provisioning (alta automática)

`POST /admin/tenants` ejecuta una transacción que deja un restaurante **vendible sin tocar código**:

```
1. crea tenant (slug único, plan='trial')
2. crea restaurant (slug = subdominio, marca por defecto o plantilla elegida)
3. crea qr_code con target_url = https://{slug}.lamenu.app   (FIJA para siempre)
4. siembra categorías base + productos demo
5. invita al owner por email (set password)
→ Respuesta: { menu_url, admin_url, qr_export_urls }
```

El subdominio funciona sin configurar DNS porque `*.lamenu.app` es **wildcard** apuntando al edge.

## Entrega del menú + purga de caché

```
Lectura  : edge → GET /public/menu/:slug (service role) → cachea en CDN (s-maxage alto)
Edición  : admin guarda producto/precio
           → trigger purga el caché del tag `menu:{slug}`  (Cloudflare/Vercel purge API)
           → siguiente request re-renderiza con datos frescos
Fallback : botón manual "Republicar" + reintentos si el webhook de purga falla
```

Esto da velocidad de sitio estático **con** actualización casi instantánea, y el QR (que apunta a
la URL fija) nunca se invalida.

## QR — exportación

- Imagen generada con `qr-code-styling` (SVG nativo) → logo central + colores de marca.
- Export: **SVG** directo; **PNG** vía `sharp`; **PDF** de impresión (alta resolución, márgenes
  de corte) vía `pdf-lib`.
- `version` sube al re-renderizar la imagen, pero `target_url` **no cambia** → reimpresión segura.

## Analítica (raw → mart)

- Ingesta: `/public/events/*` inserta en `scan_events` / `view_events` (service role, rate-limit).
- Agregación: cron diario construye `mart_daily` (escaneos, top productos/categorías, hora pico)
  y purga raw > 90 días para controlar costo.
- Dashboard del owner lee `mart_daily` (sujeto a RLS por tenant).

## Checklist de seguridad

- [ ] Tests de aislamiento: usuario del tenant A no puede leer datos del tenant B (RLS).
- [ ] service role key solo en variables de entorno del backend.
- [ ] Rate-limit en endpoints `/public/events/*` (evitar inflar métricas).
- [ ] Validación de firma en `/webhooks/billing`.
- [ ] CORS del menú restringido; ingesta de eventos con origen validado.

## Siguiente paso (Fase 3)

Billing con **Wompi/MercadoPago** (COP), cortes por morosidad (`subscriptions.estado`), y
conexión del provisioning con el alta de suscripción.
