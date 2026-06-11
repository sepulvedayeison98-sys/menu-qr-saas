/* =============================================================================
 *  app.js — renderiza el menú desde window.RESTAURANT y maneja interacciones.
 *  Sin dependencias. Funciona como sitio estático.
 * ========================================================================== */
(function () {
  "use strict";
  const R = window.RESTAURANT;
  if (!R) return console.error("Falta la config del restaurante.");

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };

  // Formato de precio COP -> "$35.000"
  const cop = (n) => "$" + n.toLocaleString("es-CO");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // --- Inyectar marca -------------------------------------------------------
  function applyBrand() {
    const b = R.brand;
    const root = document.documentElement.style;
    root.setProperty("--acento", b.colorAcento);
    root.setProperty("--fondo", b.colorFondo);
    root.setProperty("--texto", b.colorTexto);
    document.title = `${b.nombre} — Menú`;
    $$("[data-brand-name]").forEach((n) => (n.textContent = b.nombre));
    $$("[data-monogram]").forEach((n) => (n.textContent = b.monogram));
  }

  // --- Hero -----------------------------------------------------------------
  function renderHero() {
    $("[data-hero-title]").innerHTML = R.brand.nombre.replace(/(\S+)$/, '<span class="gold">$1</span>');
    $("[data-hero-slogan]").textContent = R.brand.eslogan;
  }

  // --- Destacados (populares + chef) ---------------------------------------
  function renderFeatured() {
    const all = R.categorias.flatMap((c) => c.productos.map((p) => ({ ...p, icono: c.icono })));
    const picks = all.filter((p) => p.chef).slice(0, 3);
    while (picks.length < 3) { const x = all.find((p) => p.popular && !picks.includes(p)); if (!x) break; picks.push(x); }
    const wrap = $("[data-featured]");
    picks.forEach((p) => wrap.appendChild(el(`
      <article class="featured-card reveal">
        <div class="big-emoji">${p.icono}</div>
        <h3>${esc(p.nombre)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="price">${cop(p.precio)}</div>
      </article>`)));
  }

  // --- Barra de categorías + bloques de menú --------------------------------
  function renderMenu() {
    const bar = $("[data-cat-bar]");
    const menu = $("[data-menu]");

    R.categorias.forEach((cat, i) => {
      bar.appendChild(el(
        `<button class="cat-chip${i === 0 ? " active" : ""}" data-jump="${cat.id}">${cat.icono} ${esc(cat.nombre)}</button>`
      ));

      const block = el(`
        <div class="cat-block" id="${cat.id}">
          <div class="cat-head reveal">
            <span class="cat-icon">${cat.icono}</span>
            <h2>${esc(cat.nombre)}</h2>
            <span class="cat-desc">${esc(cat.descripcion)}</span>
          </div>
          <div class="menu-grid"></div>
        </div>`);
      const grid = $(".menu-grid", block);

      cat.productos.forEach((p) => {
        const tags = [
          p.popular ? '<span class="tag popular">★ Popular</span>' : "",
          p.chef ? '<span class="tag chef">Recomendado del chef</span>' : "",
        ].join("");
        grid.appendChild(el(`
          <article class="dish reveal" data-product="${esc(p.nombre)}" data-cat="${cat.id}">
            <div class="dish-emoji">${cat.icono}</div>
            <div class="dish-body">
              <div class="dish-top">
                <span class="dish-name">${esc(p.nombre)}</span>
                <span class="dish-price">${cop(p.precio)}</span>
              </div>
              <p class="dish-desc">${esc(p.desc)}</p>
              ${tags ? `<div class="tags">${tags}</div>` : ""}
            </div>
          </article>`));
      });
      menu.appendChild(block);
    });

    // Navegación por categorías (scroll suave)
    $$("[data-jump]", bar).forEach((chip) =>
      chip.addEventListener("click", () => {
        const t = document.getElementById(chip.dataset.jump);
        t && t.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );

    // Chip activo según la categoría visible
    const blocks = $$(".cat-block");
    const onScroll = () => {
      const y = window.scrollY + 160;
      let cur = blocks[0]?.id;
      blocks.forEach((b) => { if (b.offsetTop <= y) cur = b.id; });
      $$(".cat-chip", bar).forEach((c) => c.classList.toggle("active", c.dataset.jump === cur));
      // Centrar el chip activo SOLO en horizontal (no usar scrollIntoView: mueve la página)
      const active = $(".cat-chip.active", bar);
      if (active) {
        const target = active.offsetLeft - bar.clientWidth / 2 + active.clientWidth / 2;
        bar.scrollTo({ left: target, behavior: "smooth" });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // --- Sobre nosotros + diferenciadores ------------------------------------
  function renderAbout() {
    const a = R.sobreNosotros;
    $("[data-about-title]").textContent = a.titulo;
    const body = $("[data-about-body]");
    a.parrafos.forEach((p) => body.appendChild(el(`<p>${esc(p)}</p>`)));
    const diffs = $("[data-diffs]");
    a.diferenciadores.forEach((d) => diffs.appendChild(el(`
      <div class="diff"><div class="ico">${d.icono}</div><h4>${esc(d.titulo)}</h4><p>${esc(d.texto)}</p></div>`)));
  }

  // --- Footer + redes + WhatsApp -------------------------------------------
  function renderContacto() {
    const c = R.contacto;
    $("[data-foot-address]").textContent = c.direccion;
    $("[data-foot-phone]").textContent = c.telefono;
    const waLink = $("[data-wa-link]");
    if (waLink) waLink.href = `https://wa.me/${c.whatsapp}`;

    $$("[data-ig]").forEach((a) => (a.href = c.redes.instagram));
    $$("[data-fb]").forEach((a) => (a.href = c.redes.facebook));
    $$("[data-tk]").forEach((a) => (a.href = c.redes.tiktok));
    $("[data-wa]").href = `https://wa.me/${c.whatsapp}`;
    $("[data-year]").textContent = new Date().getFullYear();
  }

  // --- Formulario de reservas (demo: arma WhatsApp) -------------------------
  function wireForm() {
    const form = $("[data-reserva]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const msg = encodeURIComponent(
        `¡Hola ${R.brand.nombre}! Quiero reservar:\n` +
        `Nombre: ${d.nombre}\nPersonas: ${d.personas}\nFecha: ${d.fecha} ${d.hora}\n` +
        `Tel: ${d.telefono}\nNotas: ${d.comentarios || "—"}`
      );
      $("[data-form-ok]").style.display = "block";
      window.open(`https://wa.me/${R.contacto.whatsapp}?text=${msg}`, "_blank");
      form.reset();
    });
  }

  // --- Scroll reveal --------------------------------------------------------
  function wireReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((n) => io.observe(n));
  }

  // --- Nav sombreada al hacer scroll ---------------------------------------
  function wireNav() {
    const nav = $(".nav");
    window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 10), { passive: true });
  }

  // --- Tracking de analítica (stub -> futuro endpoint /public/events) -------
  function wireAnalytics() {
    // Escaneo / visita a la página
    track("scan", { src: new URLSearchParams(location.search).get("src") || "directo" });
    // Vista de producto al entrar en viewport
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !seen.has(e.target.dataset.product)) {
          seen.add(e.target.dataset.product);
          track("view", { type: "producto", nombre: e.target.dataset.product, cat: e.target.dataset.cat });
        }
      });
    }, { threshold: 0.6 });
    $$("[data-product]").forEach((n) => io.observe(n));
  }
  function track(evento, data) {
    // Producción: navigator.sendBeacon("/public/events/" + evento, JSON.stringify({slug, ...data}))
    if (window.__DEBUG_ANALYTICS) console.log("[track]", evento, data);
  }

  // --- Init -----------------------------------------------------------------
  async function init() {
    // Menú EN VIVO desde Supabase si está configurado; si no, datos estáticos.
    try {
      if (window.DataSource) {
        const cats = await window.DataSource.loadMenu();
        if (cats && cats.length) R.categorias = cats;
      }
    } catch (e) {
      console.warn("Menú live no disponible, uso datos estáticos:", e.message);
    }
    applyBrand(); renderHero(); renderFeatured(); renderMenu();
    renderAbout(); renderContacto();
    wireForm(); wireReveal(); wireNav(); wireAnalytics();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
