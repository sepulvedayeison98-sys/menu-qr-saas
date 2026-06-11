/* =============================================================================
 *  Config de Supabase — rellena con los datos de TU proyecto.
 *  Supabase → Project Settings → API:  Project URL  y  anon public key.
 *  La anon key es PÚBLICA por diseño (segura gracias a RLS). Nunca pongas
 *  aquí la service_role key.
 *
 *  Mientras tenga los valores DEMO, el sitio funciona en modo estático
 *  (lee el menú de restaurant.js). Al poner valores reales, pasa a modo live.
 * ========================================================================== */
window.SUPABASE_CONFIG = {
  url: "https://TU-PROYECTO.supabase.co",
  anonKey: "TU_ANON_KEY",

  // slug del restaurante que muestra ESTE sitio (subdominio / tenant)
  restaurantSlug: "la-burguesia",
};

// ¿Está configurado de verdad? (no quedaron los placeholders)
window.SUPABASE_READY = (function () {
  var c = window.SUPABASE_CONFIG;
  return !!c && c.url.indexOf("TU-PROYECTO") === -1 && c.anonKey.indexOf("TU_ANON") === -1;
})();
