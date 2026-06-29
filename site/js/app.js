/* =============================================================================
 *  app.js — renderiza el menú de bebidas desde window.RESTAURANT.
 *  Diseño "La Cafeleta": columna única, hero con monograma, lista BEBIDAS.
 *  Sin dependencias. Funciona como sitio estático (esta es la página del QR).
 * ========================================================================== */
(function () {
  "use strict";
  const R = window.RESTAURANT;
  if (!R) return console.error("Falta la config del restaurante (restaurant.js).");

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // Precio: entero COP -> "$7.000". Si ya viene como string, se deja igual.
  const cop = (v) => (typeof v === "number" ? "$" + v.toLocaleString("es-CO") : esc(v));

  const b = R.brand || {};

  // --- Tema (dark / cream) + acento -----------------------------------------
  const variant = b.variant === "cream" ? "cream" : "dark";
  document.body.classList.add("theme-" + variant);
  document.documentElement.style.setProperty("--acento", b.colorAcento || "#D4AF37");

  // --- Marca ----------------------------------------------------------------
  if (b.nombre) document.title = b.nombre + " — Menú";
  $$("[data-brand-name]").forEach((n) => (n.textContent = b.nombre || ""));
  $$("[data-monogram]").forEach((n) => (n.textContent = b.monogram || ""));
  const tag = $("[data-tagline]"); if (tag && b.tagline) tag.textContent = b.tagline;
  const foot = $("[data-footnote]");
  if (foot) foot.textContent = b.footnote || ("© " + new Date().getFullYear() + " " + (b.nombre || "").toUpperCase());

  // --- Lista de bebidas -----------------------------------------------------
  const bebidas = R.bebidas || [];
  const list = $("[data-drinks]");
  if (list) {
    bebidas.forEach((d, i) => {
      const nombre = d.nombre || d.name || "";
      const inicial = nombre.trim().charAt(0).toUpperCase();
      const precio = cop(d.precio != null ? d.precio : d.price);
      const desc = d.desc || "";
      // Si la bebida tiene foto (campo `img`) se muestra; si no, la inicial dorada.
      const thumb = d.img
        ? `<div class="thumb has-img"><img src="${esc(d.img)}" alt="${esc(nombre)}" loading="lazy"></div>`
        : `<div class="thumb">${esc(inicial)}</div>`;
      list.appendChild(el(`
        <li class="drink" data-index="${i}">
          ${thumb}
          <div class="drink-body">
            <div class="drink-top">
              <span class="drink-name">${esc(nombre)}</span>
              <span class="leader"></span>
              <span class="drink-price">${precio}</span>
            </div>
            <p class="drink-desc">${esc(desc)}</p>
          </div>
        </li>`));
    });
  }

  // --- Lightbox: clic en foto/nombre -> imagen grande + descripción ---------
  const lb = el(`
    <div class="lightbox" hidden role="dialog" aria-modal="true" aria-label="Detalle del producto">
      <div class="lightbox-card" role="document">
        <div class="lightbox-media"></div>
        <h3 class="lightbox-name"></h3>
        <div class="lightbox-price"></div>
        <p class="lightbox-desc"></p>
      </div>
    </div>`);
  document.body.appendChild(lb);
  const lbMedia = $(".lightbox-media", lb);
  const lbName = $(".lightbox-name", lb);
  const lbPrice = $(".lightbox-price", lb);
  const lbDesc = $(".lightbox-desc", lb);

  function openLightbox(d) {
    if (!d) return;
    const nombre = d.nombre || d.name || "";
    const inicial = nombre.trim().charAt(0).toUpperCase();
    lbMedia.innerHTML = d.img
      ? `<img src="${esc(d.img)}" alt="${esc(nombre)}">`
      : `<div class="lightbox-initial">${esc(inicial)}</div>`;
    lbName.textContent = nombre;
    lbPrice.textContent = cop(d.precio != null ? d.precio : d.price);
    lbDesc.textContent = d.desc || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
  }

  // Solo abre al tocar la foto o el nombre (no la descripción ni el precio).
  if (list) {
    list.addEventListener("click", (e) => {
      if (!e.target.closest(".drink-name") && !e.target.closest(".thumb")) return;
      const li = e.target.closest(".drink");
      if (li) openLightbox(bebidas[+li.dataset.index]);
    });
  }
  // Salir: clic fuera de la tarjeta o tecla Esc.
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) closeLightbox(); });
})();
