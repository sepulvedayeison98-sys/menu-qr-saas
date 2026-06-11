/* =============================================================================
 *  data-source.js — de dónde sale el menú.
 *  - Si Supabase está configurado: lee categorías + productos EN VIVO vía
 *    PostgREST (anon key, solo lectura pública de contenido activo).
 *  - Si no: devuelve null y el sitio usa los datos estáticos de restaurant.js.
 *  Mapea la fila de la BD a la misma forma que window.RESTAURANT.categorias.
 * ========================================================================== */
window.DataSource = (function () {
  "use strict";

  async function rest(path) {
    var c = window.SUPABASE_CONFIG;
    var res = await fetch(c.url + "/rest/v1/" + path, {
      headers: { apikey: c.anonKey, Authorization: "Bearer " + c.anonKey },
    });
    if (!res.ok) throw new Error("Supabase " + res.status + ": " + (await res.text()));
    return res.json();
  }

  // Devuelve el array de categorías (con productos) o null si no hay backend.
  async function loadMenu() {
    if (!window.SUPABASE_READY) return null;
    var slug = window.SUPABASE_CONFIG.restaurantSlug;

    // 1) restaurante por slug
    var rest1 = await rest("restaurants?slug=eq." + encodeURIComponent(slug) + "&activo=eq.true&select=id");
    if (!rest1.length) return null;
    var rid = rest1[0].id;

    // 2) categorías + productos en una sola query embebida
    var cats = await rest(
      "categories?restaurant_id=eq." + rid + "&activo=eq.true&order=orden" +
      "&select=id,nombre,descripcion,icono,orden," +
      "products(nombre,descripcion,precio,es_popular,recomendado_chef,activo,orden)"
    );

    return cats.map(function (c) {
      return {
        id: slugify(c.nombre),
        nombre: c.nombre,
        icono: c.icono || "🍽️",
        descripcion: c.descripcion || "",
        productos: (c.products || [])
          .filter(function (p) { return p.activo !== false; })
          .sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); })
          .map(function (p) {
            return {
              nombre: p.nombre,
              precio: p.precio,
              desc: p.descripcion || "",
              popular: !!p.es_popular,
              chef: !!p.recomendado_chef,
            };
          }),
      };
    });
  }

  function slugify(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  return { loadMenu: loadMenu };
})();
