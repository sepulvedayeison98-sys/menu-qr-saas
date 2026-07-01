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

  // --- Menú por categorías --------------------------------------------------
  const cats = R.categorias || [];
  const allItems = [];        // aplanado, indexado por data-index para el lightbox
  const menu = $("[data-menu]");

  // Celda de precio: único ("$X") o varios tamaños ("9 oz $X").
  function priceCell(d) {
    if (Array.isArray(d.precios) && d.precios.length) {
      return `<span class="drink-price multi">` +
        d.precios.map((p) => `<span class="pl"><span class="tam">${esc(p.tam)}</span>${cop(p.precio)}</span>`).join("") +
        `</span>`;
    }
    return `<span class="drink-price">${cop(d.precio)}</span>`;
  }

  if (menu) {
    cats.forEach((cat) => {
      const section = el(`
        <section class="menu-section">
          <p class="section-label">${esc((cat.nombre || "").toUpperCase())}</p>
          <div class="ornament-short"><span class="line"></span></div>
          <ul class="drink-list"></ul>
        </section>`);
      const ul = $(".drink-list", section);
      (cat.items || []).forEach((d) => {
        const idx = allItems.push(d) - 1;
        const nombre = d.nombre || "";
        const inicial = nombre.trim().charAt(0).toUpperCase();
        const thumb = d.img
          ? `<div class="thumb has-img"><img src="${esc(d.img)}" alt="${esc(nombre)}" loading="lazy"></div>`
          : `<div class="thumb">${esc(inicial)}</div>`;
        const apx = d.aperitivo ? `<span class="aperitivo-mark" title="Aperitivo opcional">*</span>` : "";
        const desc = d.desc ? `<p class="drink-desc">${esc(d.desc)}</p>` : "";
        ul.appendChild(el(`
          <li class="drink" data-index="${idx}">
            ${thumb}
            <div class="drink-body">
              <div class="drink-top">
                <span class="drink-name">${esc(nombre)}${apx}</span>
                <span class="leader"></span>
                ${priceCell(d)}
              </div>
              ${desc}
            </div>
          </li>`));
      });
      menu.appendChild(section);
    });
  }

  // Nota de aperitivo opcional (ítems marcados con *)
  const apNote = $("[data-aperitivo-note]");
  if (apNote && R.aperitivo) {
    apNote.innerHTML = `<span class="aperitivo-mark">*</span> Aperitivo opcional: ${esc(R.aperitivo)}.`;
    apNote.hidden = false;
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
    lbPrice.textContent = Array.isArray(d.precios) && d.precios.length
      ? d.precios.map((p) => `${p.tam} ${cop(p.precio)}`).join("  ·  ")
      : cop(d.precio);
    let desc = d.desc || "";
    if (d.aperitivo && R.aperitivo) desc += (desc ? "  " : "") + "· Con aperitivo opcional.";
    lbDesc.textContent = desc;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
  }

  // Solo abre al tocar la foto o el nombre (no la descripción ni el precio).
  if (menu) {
    menu.addEventListener("click", (e) => {
      if (!e.target.closest(".drink-name") && !e.target.closest(".thumb")) return;
      const li = e.target.closest(".drink");
      if (li) openLightbox(allItems[+li.dataset.index]);
    });
  }
  // Salir: clic fuera de la tarjeta o tecla Esc.
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) closeLightbox(); });
})();
