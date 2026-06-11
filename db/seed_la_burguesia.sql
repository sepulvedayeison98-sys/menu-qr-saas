-- =============================================================================
--  Seed — Restaurante LA BURGUESÍA  (datos reales del menú)
--  Precios en pesos colombianos (COP) como entero.
--  Idempotente: se puede re-ejecutar; limpia el restaurante antes de re-sembrar.
-- =============================================================================

begin;

-- --- Tenant + restaurante -----------------------------------------------------
insert into tenants (id, slug, nombre, plan, estado)
values ('00000000-0000-0000-0000-000000000001', 'la-burguesia', 'La Burguesía', 'pro', 'activo')
on conflict (slug) do nothing;

delete from restaurants where slug = 'la-burguesia';  -- re-seed limpio (cascada borra hijos)

insert into restaurants (id, tenant_id, slug, nombre, eslogan, brand, info, moneda)
values (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000001',
  'la-burguesia',
  'La Burguesía',
  'Hamburguesas de autor, cortes y sabor mexicano',
  '{"primario":"#111111","acento":"#e4b343","fondo":"#0d0d0d","texto":"#f5f5f5","fuente":"Inter"}',
  '{"telefono":"","direccion":"","horarios":"","redes":{}}',
  'COP'
);

-- --- Categorías ---------------------------------------------------------------
insert into categories (restaurant_id, nombre, descripcion, icono, orden) values
  ('00000000-0000-0000-0000-0000000000a1', 'Hamburguesas', 'Carne 100% de res a la parrilla en pan artesanal', '🍔', 1),
  ('00000000-0000-0000-0000-0000000000a1', 'Cortes de Res', 'Cortes premium servidos con ensalada y papas a la francesa', '🥩', 2),
  ('00000000-0000-0000-0000-0000000000a1', 'Mexicana', 'Tortillas, birria y sabores tradicionales', '🌮', 3),
  ('00000000-0000-0000-0000-0000000000a1', 'Alitas', 'Crocantes por fuera, jugosas por dentro', '🍗', 4),
  ('00000000-0000-0000-0000-0000000000a1', 'Gorditas', 'Especialidad de la casa', '🫓', 5),
  ('00000000-0000-0000-0000-0000000000a1', 'Bebidas', 'Cervezas, gaseosas, jugos, limonadas y sodas', '🥤', 6);

-- Helper de inserción: category_id por nombre dentro del restaurante.
-- (Subconsultas para no acoplar a UUIDs de categoría.)

-- --- Hamburguesas -------------------------------------------------------------
insert into products (category_id, restaurant_id, nombre, descripcion, precio, es_popular, recomendado_chef, orden)
select c.id, c.restaurant_id, v.nombre, v.descripcion, v.precio, v.pop, v.chef, v.orden
from categories c
join (values
  ('Las de Siempre', 'Insignia: 150 g de res a la parrilla, pan artesanal de huevo y parmesano, queso cheddar fundido, tocineta ahumada, pepinillos, tomate y lechuga. Salsa Big Animal.', 27000, true, false, 1),
  ('Burger Fred', 'Jugosa carne de res (150 g) en brioche con ají negro, queso cheddar y tocineta ahumada, 80 g de pulled pork bañado en salsa BBQ honey.', 35000, true, false, 2),
  ('Rústica', '150 g de res a la parrilla en pan brioche con ají negro, queso cheddar, tocineta y 80 g de chicharrón en reducción BBQ.', 35000, false, false, 3),
  ('Clásica Dorada', 'Res (150 g) en pan artesanal de orégano y parmesano, queso cheddar y tocineta ahumada, aros de cebolla y queso mozzarella apanados.', 35000, false, false, 4),
  ('Wagyu', 'Carne 100% wagyu de jugosidad y suavidad excepcional, doble combinación de quesos cheddar y mozzarella, tocineta ahumada y relish de pepinillos.', 42000, false, true, 5)
) as v(nombre, descripcion, precio, pop, chef, orden) on true
where c.restaurant_id = '00000000-0000-0000-0000-0000000000a1' and c.nombre = 'Hamburguesas';

-- --- Cortes de Res ------------------------------------------------------------
insert into products (category_id, restaurant_id, nombre, descripcion, precio, es_popular, recomendado_chef, orden)
select c.id, c.restaurant_id, v.nombre, v.descripcion, v.precio, v.pop, v.chef, v.orden
from categories c
join (values
  ('Punta de Anca (Picanha)', 'Corte trasero de la res, reconocido por su jugosidad y terneza. Capa de grasa que realza el sabor.', 40000, true, true, 1),
  ('New York Steak', 'Corte premium del lomo de la res, zona de baja actividad muscular que garantiza textura suave y jugosa.', 40000, false, false, 2),
  ('Solomito (Tenderloin)', 'El corte más fino y tierno de la res, valorado por su suavidad excepcional.', 40000, false, true, 3),
  ('Rib Eye (Ojo de Bife)', 'Corte jugoso y lleno de sabor, de la parte alta del costillar. Marmoleo natural, suave y aromático.', 40000, true, false, 4)
) as v(nombre, descripcion, precio, pop, chef, orden) on true
where c.restaurant_id = '00000000-0000-0000-0000-0000000000a1' and c.nombre = 'Cortes de Res';

-- --- Mexicana -----------------------------------------------------------------
insert into products (category_id, restaurant_id, nombre, descripcion, precio, es_popular, recomendado_chef, orden)
select c.id, c.restaurant_id, v.nombre, v.descripcion, v.precio, v.pop, v.chef, v.orden
from categories c
join (values
  ('Quesadilla', 'Tortilla de harina rellena con carne de res mechada y adobada, queso mozzarella fundido. Guacamole y frijoles refritos.', 30000, false, false, 1),
  ('Pizza Birria', 'Dos tortillas de harina doradas rellenas de mozzarella, selladas con costra de queso crocante. Carne estilo birria, sour cream, cebolla, cilantro y queso.', 40000, true, true, 2),
  ('Burro', 'Tortilla de harina rellena con carne de res asada. Guacamole, frijoles refritos, pico de gallo y sour cream.', 30000, false, false, 3),
  ('Tacos', 'Cuatro tortillas de maíz rellenas con cerdo al pastor, cebolla, cilantro y trozos de piña.', 30000, true, false, 4),
  ('Flautas La Burguesía', 'Cinco crujientes tortillas doradas rellenas de carne sazonada estilo de la casa. Guacamole, pico de gallo, lechuga y queso.', 35000, false, false, 5)
) as v(nombre, descripcion, precio, pop, chef, orden) on true
where c.restaurant_id = '00000000-0000-0000-0000-0000000000a1' and c.nombre = 'Mexicana';

-- --- Alitas -------------------------------------------------------------------
insert into products (category_id, restaurant_id, nombre, descripcion, precio, es_popular, recomendado_chef, orden)
select c.id, c.restaurant_id, v.nombre, v.descripcion, v.precio, v.pop, v.chef, v.orden
from categories c
join (values
  ('Combo 7 Alitas', 'Siete alitas crocantes bañadas en la salsa de tu elección.', 28000, false, false, 1),
  ('Combo 14 Alitas', 'Catorce alitas crocantes por fuera y jugosas por dentro, salsa a elección.', 50000, true, false, 2),
  ('Combo 21 Alitas', 'Veintiuna alitas en su punto, con generosa porción de salsa a elección.', 75000, false, false, 3),
  ('Combo 30 Alitas', 'Treinta alitas en su punto perfecto, ideal para compartir en familia.', 95000, true, false, 4),
  ('Combo Alitas & Boneless', '7 alitas y 7 boneless crujientes. Acompañados con papas a la francesa y salsas especiales.', 50000, false, true, 5)
) as v(nombre, descripcion, precio, pop, chef, orden) on true
where c.restaurant_id = '00000000-0000-0000-0000-0000000000a1' and c.nombre = 'Alitas';

-- --- Gorditas -----------------------------------------------------------------
insert into products (category_id, restaurant_id, nombre, descripcion, precio, es_popular, recomendado_chef, orden)
select c.id, c.restaurant_id, v.nombre, v.descripcion, v.precio, v.pop, v.chef, v.orden
from categories c
join (values
  ('Gorditas de Pulled Pork', 'Gorditas rellenas de queso mozzarella derretido, coronadas con pulled pork jugoso, guacamole, pico de gallo y pimentón salteado.', 35000, true, true, 1)
) as v(nombre, descripcion, precio, pop, chef, orden) on true
where c.restaurant_id = '00000000-0000-0000-0000-0000000000a1' and c.nombre = 'Gorditas';

-- --- Bebidas (representativas) -------------------------------------------------
insert into products (category_id, restaurant_id, nombre, descripcion, precio, es_popular, recomendado_chef, orden)
select c.id, c.restaurant_id, v.nombre, v.descripcion, v.precio, false, false, v.orden
from categories c
join (values
  ('Cerveza nacional', 'Pilsen, Águila, Club Colombia, Costeñita', 5000, 1),
  ('Cerveza importada', 'Corona, Stella Artois', 8000, 2),
  ('Gaseosa', 'Coca-Cola, Postobón, Bretaña y más', 4000, 3),
  ('Jugo natural', 'Guanábana, lulo, mango, maracuyá, mora y más', 10000, 4),
  ('Limonada', 'Natural, mango biche, hierbabuena, coco, cereza, sandía', 10000, 5),
  ('Soda saborizada', 'Tamarindo, limón mango biche, limón sandía, frutos rojos', 10000, 6),
  ('Michelada', 'Preparada con tu cerveza', 7000, 7),
  ('Agua', 'Manantial / Cristal', 4000, 8)
) as v(nombre, descripcion, precio, orden) on true
where c.restaurant_id = '00000000-0000-0000-0000-0000000000a1' and c.nombre = 'Bebidas';

-- --- QR (URL fija) ------------------------------------------------------------
insert into qr_codes (restaurant_id, target_url, estilo, version)
values (
  '00000000-0000-0000-0000-0000000000a1',
  'https://la-burguesia.lamenu.app',
  '{"color":"#111111","fondo":"#ffffff","acento":"#e4b343","forma":"rounded"}',
  1
);

commit;

-- Verificación rápida:
--   select c.nombre as categoria, count(p.*) as items
--   from categories c left join products p on p.category_id = c.id
--   where c.restaurant_id = '00000000-0000-0000-0000-0000000000a1'
--   group by c.nombre order by min(c.orden);
