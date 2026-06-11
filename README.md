# La Burguesía — Menú Digital QR (plantilla premium)

Menú digital estático, mobile-first, listo para acceder por **código QR**. Construido sin
dependencias de build: HTML + CSS + JS puro. Pensado para **revenderse como plantilla**:
se rebrandea cambiando un solo archivo de configuración.

## Estructura

```
menu-qr-saas/
├── site/                      # ← el sitio (esto es lo que se publica)
│   ├── index.html             # menú del cliente
│   ├── admin/                 # panel administrativo (login + CRUD + QR)
│   │   ├── login.html         #   acceso con Supabase Auth
│   │   ├── index.html         #   dashboard protegido
│   │   └── js/ · css/         #   auth.js, dashboard.js, admin.css
│   ├── data/restaurant.js     # ⭐ marca + menú estático (fallback / branding)
│   ├── js/supabase-config.js  # credenciales de Supabase (rellenar)
│   ├── js/data-source.js      # menú live (Supabase) con fallback estático
│   ├── js/app.js              # render + interacciones del menú
│   ├── css/styles.css         # estilos premium (tema oro/negro)
│   └── server.js              # mini servidor estático para previsualizar
├── db/                        # schema.sql (multi-tenant + RLS) + seed
└── docs/                      # arquitectura, Fase 2 y setup de Supabase
```

## Cómo correrlo en local

```powershell
node site/server.js
# Menú:  http://localhost:8080
# Panel: http://localhost:8080/admin/login.html
```

(O abre `site/index.html` directo en el navegador. El panel necesita internet para la
librería de QR y el SDK de Supabase vía CDN.)

## Panel administrativo (con login)

- **Acceso:** `http://localhost:8080/admin/login.html`
- Requiere configurar Supabase una sola vez → ver [`docs/SETUP-SUPABASE.md`](docs/SETUP-SUPABASE.md).
- Funciones: login real (Supabase Auth), CRUD de productos y categorías, descarga de QR.
- Sin configurar, el panel muestra instrucciones y el menú funciona en modo estático.
- Con Supabase configurado, el menú público lee **en vivo** de la base de datos: editas un
  producto en el panel y aparece al recargar el menú.

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
