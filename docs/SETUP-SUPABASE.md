# Configurar Supabase (Fase 2 — login real + admin)

Sigue estos pasos una sola vez. Al terminar tendrás: login real, panel admin con CRUD del
menú y el menú público leyendo en vivo de la base de datos.

## 1. Crear el proyecto

1. Entra a <https://supabase.com> y crea una cuenta (gratis).
2. **New project** → ponle nombre (ej. `menu-burguesia`), elige una contraseña de BD y la
   región más cercana. Espera ~2 min a que aprovisione.

## 2. Cargar el esquema y el menú

1. En el proyecto, ve a **SQL Editor → New query**.
2. Pega y ejecuta **todo** el contenido de [`db/schema.sql`](../db/schema.sql). (Crea tablas,
   RLS, lectura pública del menú.)
3. Nueva query: pega y ejecuta [`db/seed_la_burguesia.sql`](../db/seed_la_burguesia.sql).
   (Carga el restaurante La Burguesía con su menú.)

## 3. Crear tu usuario admin y vincularlo al restaurante

1. **Authentication → Users → Add user** → escribe tu email y contraseña. Marca *Auto Confirm*.
2. Copia el **User UID** que aparece.
3. **SQL Editor**, ejecuta (reemplaza el UID y el email):

```sql
insert into profiles (id, tenant_id, email, rol)
values (
  'PEGA-AQUI-EL-USER-UID',
  '00000000-0000-0000-0000-000000000001',  -- tenant La Burguesía (del seed)
  'tu@correo.com',
  'owner'
);
```

> Sin esta fila el login funciona pero la RLS no te deja ver datos (no hay tenant asociado).

## 4. Conectar el sitio

1. **Project Settings → API**. Copia **Project URL** y la **anon public** key.
2. Edita [`site/js/supabase-config.js`](../site/js/supabase-config.js):

```js
window.SUPABASE_CONFIG = {
  url: "https://xxxxxxxx.supabase.co",  // tu Project URL
  anonKey: "eyJhbGciOi...",             // tu anon public key
  restaurantSlug: "la-burguesia",
};
```

La **anon key es pública** (segura por RLS). **Nunca** pongas aquí la `service_role` key.

## 5. Permitir el dominio del sitio

En **Authentication → URL Configuration**, agrega tu URL (ej. `http://localhost:8080` y luego
tu dominio de producción) en *Site URL* / *Redirect URLs*.

## 6. Probar

```powershell
node site/server.js
```

- Menú público: <http://localhost:8080> → ahora carga desde Supabase (si lo apagas, vuelve a los datos estáticos).
- Panel: <http://localhost:8080/admin/login.html> → inicia sesión con tu usuario.
- Crea/edita un producto → recarga el menú → el cambio aparece. ✅

## Notas de seguridad

- El aislamiento entre restaurantes lo hace **RLS** en la BD, no el frontend.
- La lectura del menú es pública (es un menú); las **escrituras** requieren sesión y solo
  afectan al restaurante del usuario.
- Para agregar más personal: crea el usuario en Auth y su fila en `profiles` con `rol='staff'`.

## Problemas comunes

| Síntoma | Causa / arreglo |
|---|---|
| "No se encontró el restaurante" tras login | Falta la fila en `profiles` (paso 3) o `restaurantSlug` no coincide. |
| El menú no carga en vivo | `supabase-config.js` tiene placeholders, o faltan las políticas `*_public_read`. |
| Login falla con "Invalid login" | Usuario no confirmado: marca *Auto Confirm* o confírmalo en Auth → Users. |
| CORS / 401 en el panel | Revisa Site URL en Authentication → URL Configuration. |
