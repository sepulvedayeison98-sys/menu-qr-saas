# La Burguesía — Menú Digital QR (plantilla premium)

Menú digital estático, mobile-first, listo para acceder por **código QR**. Construido sin
dependencias de build: HTML + CSS + JS puro. Pensado para **revenderse como plantilla**:
se rebrandea cambiando un solo archivo de configuración.

## Estructura

```
menu-qr-saas/
├── site/                      # ← el sitio (esto es lo que se publica)
│   ├── index.html             # menú del cliente
│   ├── admin.html             # generador/descarga del QR (sin login)
│   ├── data/restaurant.js     # ⭐ ÚNICA fuente de verdad: marca + menú
│   ├── js/app.js              # render + interacciones del menú
│   ├── css/styles.css         # estilos premium (tema oro/negro)
│   └── server.js              # mini servidor estático para previsualizar
├── db/                        # (opcional, futuro) esquema SaaS con Supabase
└── docs/                      # arquitectura y opción SaaS para escalar después
```

> **Enfoque actual: solo `restaurant.js`.** El menú vive en un archivo; para cambiar precios o
> platos editas ese archivo y rediespliegas. Sin backend, sin base de datos, sin login —
> carga instantánea. Las carpetas `db/` y `docs/` documentan la opción SaaS (Supabase) por si
> más adelante quieres crecer a varios restaurantes con login real; hoy no se usan.

## Cómo correrlo en local

```powershell
node site/server.js
# Menú:  http://localhost:8080
# QR:    http://localhost:8080/admin.html
```

(O abre `site/index.html` directo en el navegador. El generador de QR necesita internet para
su librería vía CDN; el menú funciona 100% offline.)

## Editar el menú

Todo está en `site/data/restaurant.js`. Cambias precios, platos, descripciones o etiquetas
(`popular`, `chef`), guardas y rediespliegas (o `git push` si tienes deploy automático).

## Rebrandear para OTRO restaurante (vender la plantilla)

Edita **solo** `site/data/restaurant.js`:

1. `brand` — nombre, eslogan, colores (`colorAcento`, `colorFondo`, `colorTexto`), monograma, `menuUrl`.
2. `contacto` — teléfono, WhatsApp, dirección, horarios, redes, mapa.
3. `sobreNosotros` — historia y diferenciadores.
4. `categorias` — categorías y productos (nombre, precio en entero, `desc`, `popular`, `chef`).

El sitio entero (colores, hero, menú, destacados, QR) se adapta solo. No se toca código.

## Publicar (hosting gratis)

Sube la carpeta `site/` a **Cloudflare Pages**, **Vercel** o **Netlify** (drag & drop).
Apunta tu dominio/subdominio y el QR del panel ya queda funcional.

## Funcionalidades incluidas

- Hero premium, destacados (popular + chef), menú por categorías con **barra sticky** de
  navegación rápida, sobre nosotros, galería, testimonios, reservas (vía WhatsApp), ubicación, footer.
- **Panel QR** (`admin.html`): personaliza color y logo, descarga **PNG / SVG / PDF**. El QR
  apunta siempre a la URL fija → no se invalida al cambiar el menú.
- SEO: meta tags, Open Graph, structured data (`Restaurant`).
- Animaciones de scroll reveal, hover en tarjetas, responsive total.
- Hooks de **analítica** ya cableados (`track()` en `app.js`) listos para conectar al backend.

## Siguiente fase (backend SaaS)

Ver [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) y
[`docs/FASE-2-CONTROL-PLANE.md`](docs/FASE-2-CONTROL-PLANE.md). El esquema multi-tenant con RLS
está en [`db/schema.sql`](db/schema.sql) y el seed real en [`db/seed_la_burguesia.sql`](db/seed_la_burguesia.sql).
