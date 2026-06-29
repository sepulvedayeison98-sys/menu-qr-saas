-- =============================================================================
--  Seed de EJEMPLO (plantilla)  —  rellena con los datos de tu restaurante.
--  Precios en pesos colombianos (COP) como entero.
--  Idempotente: se puede re-ejecutar; limpia el restaurante antes de re-sembrar.
-- =============================================================================

begin;

-- --- Tenant + restaurante -----------------------------------------------------
insert into tenants (id, slug, nombre, plan, estado)
values ('00000000-0000-0000-0000-000000000001', 'tu-restaurante', 'Tu Restaurante', 'pro', 'activo')
on conflict (slug) do nothing;

delete from restaurants where slug = 'tu-restaurante';  -- re-seed limpio (cascada borra hijos)

insert into restaurants (id, tenant_id, slug, nombre, eslogan, brand, info, moneda)
values (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000001',
  'tu-restaurante',
  'Tu Restaurante',
  'Tu eslogan aquí',
  '{"primario":"#111111","acento":"#e4b343","fondo":"#0d0d0d","texto":"#f5f5f5","fuente":"Inter"}',
  '{"telefono":"","direccion":"","horarios":"","redes":{}}',
  'COP'
);

-- --- Categorías ---------------------------------------------------------------
insert into categories (restaurant_id, nombre, descripcion, icono, orden) values
  ('00000000-0000-0000-0000-0000000000a1', 'Categoría 1', 'Descripción de la categoría', '🍽️', 1);

-- --- Productos de la categoría ------------------------------------------------
insert into products (category_id, restaurant_id, nombre, descripcion, precio, es_popular, recomendado_chef, orden)
select c.id, c.restaurant_id, v.nombre, v.descripcion, v.precio, v.pop, v.chef, v.orden
from categories c
join (values
  ('Producto de ejemplo', 'Descripción del producto. Reemplaza por los tuyos.', 10000, true, false, 1)
) as v(nombre, descripcion, precio, pop, chef, orden) on true
where c.restaurant_id = '00000000-0000-0000-0000-0000000000a1' and c.nombre = 'Categoría 1';

-- --- QR (URL fija) ------------------------------------------------------------
insert into qr_codes (restaurant_id, target_url, estilo, version)
values (
  '00000000-0000-0000-0000-0000000000a1',
  'https://tu-restaurante.lamenu.app',
  '{"color":"#111111","fondo":"#ffffff","acento":"#e4b343","forma":"rounded"}',
  1
);

commit;
