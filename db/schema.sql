-- =============================================================================
--  Plataforma SaaS de Menús QR — Esquema (Postgres / Supabase)
--  Multi-tenant con aislamiento por Row Level Security (RLS).
--  Capas: identidad/tenant → menú → qr → billing → analítica (raw → mart)
-- =============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- -----------------------------------------------------------------------------
--  1. TENANTS E IDENTIDAD
-- -----------------------------------------------------------------------------

create table tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null check (slug ~ '^[a-z0-9-]+$'),
  nombre      text not null,
  plan        text not null default 'trial' check (plan in ('trial','basic','pro')),
  estado      text not null default 'activo' check (estado in ('activo','suspendido','cancelado')),
  created_at  timestamptz not null default now()
);

-- Perfil ligado a auth.users de Supabase. id = auth.uid()
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid not null references tenants(id) on delete cascade,
  email       text not null,
  rol         text not null default 'owner' check (rol in ('owner','staff')),
  created_at  timestamptz not null default now()
);
create index on profiles (tenant_id);

-- Devuelve el tenant del usuario autenticado. SECURITY DEFINER evita recursión RLS.
create or replace function current_tenant_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select tenant_id from profiles where id = auth.uid()
$$;

-- -----------------------------------------------------------------------------
--  2. RESTAURANTE Y MENÚ
-- -----------------------------------------------------------------------------

create table restaurants (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  slug        text unique not null check (slug ~ '^[a-z0-9-]+$'),  -- subdominio
  nombre      text not null,
  eslogan     text,
  -- Marca: colores, logo, tipografía. JSONB para flexibilidad por restaurante.
  brand       jsonb not null default '{}'::jsonb,
  -- Contacto / ubicación / horarios / redes en un solo doc estructurado.
  info        jsonb not null default '{}'::jsonb,
  moneda      text not null default 'COP',
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index on restaurants (tenant_id);

create table categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  nombre        text not null,
  descripcion   text,
  icono         text not null default '🍽️',  -- emoji mostrado en el menú
  orden         int  not null default 0,
  activo        boolean not null default true
);
create index on categories (restaurant_id, orden);

create table products (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references categories(id) on delete cascade,
  restaurant_id    uuid not null references restaurants(id) on delete cascade,  -- denormalizado para RLS y queries
  nombre           text not null,
  descripcion      text,
  -- Precio como ENTERO en la unidad mínima de la moneda (COP -> pesos). Formatear en render.
  precio           bigint not null check (precio >= 0),
  imagen_url       text,
  es_popular       boolean not null default false,
  recomendado_chef boolean not null default false,
  activo           boolean not null default true,
  orden            int not null default 0
);
create index on products (restaurant_id);
create index on products (category_id, orden);

create table promotions (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  titulo        text not null,
  descripcion   text,
  precio        bigint,
  vigente_desde date,
  vigente_hasta date,
  activo        boolean not null default true
);
create index on promotions (restaurant_id);

-- -----------------------------------------------------------------------------
--  3. CÓDIGOS QR
--  target_url es FIJA: nunca cambia aunque se editen productos/precios.
--  El estilo (logo/colores) afecta solo la imagen, no el destino.
-- -----------------------------------------------------------------------------

create table qr_codes (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  target_url    text not null,                 -- https://{slug}.lamenu.app
  estilo        jsonb not null default '{}'::jsonb,  -- {color, fondo, logo_url, forma}
  version       int  not null default 1,        -- sube al re-renderizar la imagen
  created_at    timestamptz not null default now()
);
create index on qr_codes (restaurant_id);

-- -----------------------------------------------------------------------------
--  4. BILLING / SUSCRIPCIONES
-- -----------------------------------------------------------------------------

create table subscriptions (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  proveedor       text not null default 'wompi' check (proveedor in ('wompi','mercadopago','stripe')),
  proveedor_ref   text,                          -- id de la suscripción en el proveedor
  plan            text not null,
  estado          text not null default 'activa' check (estado in ('activa','morosa','cancelada')),
  periodo_fin     timestamptz,
  created_at      timestamptz not null default now()
);
create index on subscriptions (tenant_id);

-- -----------------------------------------------------------------------------
--  5. ANALÍTICA  (Raw -> Mart)
--  Inserción solo vía service role (endpoint de ingesta). Sin RLS de tenant en insert.
-- -----------------------------------------------------------------------------

create table scan_events (
  id            bigserial primary key,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  ts            timestamptz not null default now(),
  src           text,        -- mesa | redes | factura | tarjeta ...
  device        text,        -- mobile | tablet | desktop
  referer       text
);
create index on scan_events (restaurant_id, ts);

create table view_events (
  id            bigserial primary key,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  target_type   text not null check (target_type in ('producto','categoria')),
  target_id     uuid not null,
  ts            timestamptz not null default now()
);
create index on view_events (restaurant_id, ts);

-- Tabla agregada (mart) que alimenta los dashboards. Poblada por cron.
create table mart_daily (
  restaurant_id  uuid not null references restaurants(id) on delete cascade,
  fecha          date not null,
  escaneos       int not null default 0,
  top_productos  jsonb not null default '[]'::jsonb,
  top_categorias jsonb not null default '[]'::jsonb,
  hora_pico      int,  -- 0-23
  primary key (restaurant_id, fecha)
);

-- =============================================================================
--  ROW LEVEL SECURITY  —  aislamiento por tenant
-- =============================================================================

alter table tenants       enable row level security;
alter table profiles      enable row level security;
alter table restaurants   enable row level security;
alter table categories    enable row level security;
alter table products      enable row level security;
alter table promotions    enable row level security;
alter table qr_codes      enable row level security;
alter table subscriptions enable row level security;
alter table mart_daily    enable row level security;

-- Tenant: el usuario solo ve/edita su propio tenant.
create policy tenant_isolation on tenants
  using (id = current_tenant_id());

-- Profiles: ver miembros del mismo tenant.
create policy profile_same_tenant on profiles
  using (tenant_id = current_tenant_id());

-- Helper macro: política estándar "mismo tenant" para tablas con tenant_id.
create policy restaurants_tenant on restaurants
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

create policy subscriptions_tenant on subscriptions
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

-- Tablas que cuelgan de restaurant: se valida vía restaurant_id -> tenant.
create policy categories_tenant on categories
  using  (restaurant_id in (select id from restaurants where tenant_id = current_tenant_id()))
  with check (restaurant_id in (select id from restaurants where tenant_id = current_tenant_id()));

create policy products_tenant on products
  using  (restaurant_id in (select id from restaurants where tenant_id = current_tenant_id()))
  with check (restaurant_id in (select id from restaurants where tenant_id = current_tenant_id()));

create policy promotions_tenant on promotions
  using  (restaurant_id in (select id from restaurants where tenant_id = current_tenant_id()))
  with check (restaurant_id in (select id from restaurants where tenant_id = current_tenant_id()));

create policy qr_tenant on qr_codes
  using  (restaurant_id in (select id from restaurants where tenant_id = current_tenant_id()))
  with check (restaurant_id in (select id from restaurants where tenant_id = current_tenant_id()));

create policy mart_tenant on mart_daily
  using (restaurant_id in (select id from restaurants where tenant_id = current_tenant_id()));

-- -----------------------------------------------------------------------------
--  LECTURA PÚBLICA DEL MENÚ
--  El menú estático lo lee el cliente con la anon key. Solo SELECT de
--  contenido activo (el menú es público por naturaleza). Las escrituras siguen
--  restringidas a la política de tenant.
-- -----------------------------------------------------------------------------
create policy restaurants_public_read on restaurants for select using (activo = true);
create policy categories_public_read  on categories  for select using (activo = true);
create policy products_public_read    on products    for select using (activo = true);

grant select on restaurants, categories, products to anon;

-- NOTA:
--  * La ENTREGA del menú (edge) y la INGESTA de analítica usan la SERVICE ROLE KEY,
--    que omite RLS por diseño. Nunca exponer esa key en el cliente.
--  * scan_events / view_events no tienen RLS de lectura pública: se consultan
--    solo desde el backend (service role) para construir mart_daily.
