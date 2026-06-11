/* Dashboard admin: CRUD de productos y categorías sobre Supabase.
   RLS garantiza que solo se ve/edita el restaurante del tenant del usuario. */
import { supabase, signOut, requireSession } from "./auth.js";

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const cop = (n) => "$" + Number(n).toLocaleString("es-CO");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const SLUG = (window.SUPABASE_CONFIG || {}).restaurantSlug;
let RID = null;       // restaurant id
let CATS = [];        // categorías + productos
let editingId = null; // producto en edición

init();

async function init() {
  if (!window.SUPABASE_READY) {
    document.body.innerHTML =
      '<div class="wrap"><div class="warn">Configura Supabase en <code>site/js/supabase-config.js</code> y recarga. Ver <code>docs/SETUP-SUPABASE.md</code>.</div></div>';
    return;
  }
  const session = await requireSession();
  if (!session) return;

  $("#userEmail").textContent = session.user.email;
  $("#logoutBtn").onclick = signOut;
  wireTabs();
  wireProductForm();
  wireCategoryForm();
  await load();
}

async function load() {
  const { data: r, error: er } = await supabase
    .from("restaurants").select("id,nombre").eq("slug", SLUG).single();
  if (er || !r) { toast("No se encontró el restaurante para este usuario.", true); return; }
  RID = r.id;
  $("#rName").textContent = r.nombre;

  const { data: cats, error } = await supabase
    .from("categories")
    .select("id,nombre,icono,orden,products(id,nombre,precio,descripcion,es_popular,recomendado_chef,activo,orden)")
    .eq("restaurant_id", RID).order("orden");
  if (error) { toast(error.message, true); return; }
  CATS = cats || [];
  renderCatSelect();
  renderProducts();
  renderCategories();
}

/* ----------------------------- Productos -------------------------------- */
function renderCatSelect() {
  $("#pCat").innerHTML = CATS.map((c) => `<option value="${c.id}">${c.icono} ${esc(c.nombre)}</option>`).join("");
}

function renderProducts() {
  const host = $("#prodList");
  if (!CATS.length) { host.innerHTML = '<p class="muted">Aún no hay categorías. Crea una en la pestaña Categorías.</p>'; return; }
  host.innerHTML = CATS.map((c) => {
    const prods = (c.products || []).sort((a, b) => (a.orden || 0) - (b.orden || 0));
    const rows = prods.map((p) => `
      <div class="prod ${p.activo ? "" : "off"}" data-id="${p.id}">
        <div class="grow">
          <span class="name">${esc(p.nombre)}</span>
          ${p.es_popular ? '<span class="badge">Popular</span>' : ""}
          ${p.recomendado_chef ? '<span class="badge chef">Chef</span>' : ""}
          <div class="desc">${esc(p.descripcion)}</div>
        </div>
        <span class="price">${cop(p.precio)}</span>
        <div class="actions">
          <button class="btn btn-ghost btn-sm" data-edit="${p.id}">Editar</button>
          <button class="btn btn-ghost btn-sm" data-toggle="${p.id}">${p.activo ? "Ocultar" : "Mostrar"}</button>
          <button class="btn btn-danger btn-sm" data-del="${p.id}">✕</button>
        </div>
      </div>`).join("");
    return `<div class="cat-group"><h3>${c.icono} ${esc(c.nombre)} <span class="muted">(${prods.length})</span></h3>${rows || '<p class="muted">Sin productos.</p>'}</div>`;
  }).join("");

  $$("[data-edit]", host).forEach((b) => (b.onclick = () => startEdit(b.dataset.edit)));
  $$("[data-del]", host).forEach((b) => (b.onclick = () => delProduct(b.dataset.del)));
  $$("[data-toggle]", host).forEach((b) => (b.onclick = () => toggleProduct(b.dataset.toggle)));
}

function findProduct(id) {
  for (const c of CATS) { const p = (c.products || []).find((x) => x.id === id); if (p) return p; }
  return null;
}

function wireProductForm() {
  $("#prodForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      category_id: $("#pCat").value,
      restaurant_id: RID,
      nombre: $("#pNombre").value.trim(),
      precio: parseInt($("#pPrecio").value, 10) || 0,
      descripcion: $("#pDesc").value.trim(),
      es_popular: $("#pPop").checked,
      recomendado_chef: $("#pChef").checked,
    };
    let res;
    if (editingId) res = await supabase.from("products").update(payload).eq("id", editingId);
    else res = await supabase.from("products").insert(payload);
    if (res.error) return toast(res.error.message, true);
    toast(editingId ? "Producto actualizado." : "Producto agregado.");
    resetProductForm();
    await load();
  });
  $("#pCancel").onclick = resetProductForm;
}

function startEdit(id) {
  const p = findProduct(id); if (!p) return;
  editingId = id;
  $("#pNombre").value = p.nombre;
  $("#pPrecio").value = p.precio;
  $("#pDesc").value = p.descripcion || "";
  $("#pPop").checked = !!p.es_popular;
  $("#pChef").checked = !!p.recomendado_chef;
  for (const c of CATS) if ((c.products || []).some((x) => x.id === id)) $("#pCat").value = c.id;
  $("#pFormTitle").textContent = "Editar producto";
  $("#pSubmit").textContent = "Guardar cambios";
  $("#pCancel").hidden = false;
  $("#prodForm").scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetProductForm() {
  editingId = null;
  $("#prodForm").reset();
  $("#pFormTitle").textContent = "Nuevo producto";
  $("#pSubmit").textContent = "Agregar producto";
  $("#pCancel").hidden = true;
}

async function delProduct(id) {
  const p = findProduct(id);
  if (!confirm(`¿Eliminar "${p?.nombre}"? Esta acción no se puede deshacer.`)) return;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return toast(error.message, true);
  toast("Producto eliminado.");
  await load();
}

async function toggleProduct(id) {
  const p = findProduct(id); if (!p) return;
  const { error } = await supabase.from("products").update({ activo: !p.activo }).eq("id", id);
  if (error) return toast(error.message, true);
  await load();
}

/* ----------------------------- Categorías ------------------------------- */
function renderCategories() {
  const host = $("#catList");
  host.innerHTML = CATS.map((c) => `
    <div class="prod" data-id="${c.id}">
      <div class="grow"><span class="name">${c.icono} ${esc(c.nombre)}</span>
        <div class="desc">${esc(c.descripcion || "")} · ${(c.products || []).length} productos</div></div>
      <div class="actions"><button class="btn btn-danger btn-sm" data-delcat="${c.id}">✕</button></div>
    </div>`).join("") || '<p class="muted">Sin categorías.</p>';
  $$("[data-delcat]", host).forEach((b) => (b.onclick = () => delCategory(b.dataset.delcat)));
}

function wireCategoryForm() {
  $("#catForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      restaurant_id: RID,
      nombre: $("#cNombre").value.trim(),
      icono: $("#cIcono").value.trim() || "🍽️",
      descripcion: $("#cDesc").value.trim(),
      orden: CATS.length + 1,
    };
    const { error } = await supabase.from("categories").insert(payload);
    if (error) return toast(error.message, true);
    toast("Categoría creada.");
    $("#catForm").reset();
    await load();
  });
}

async function delCategory(id) {
  const c = CATS.find((x) => x.id === id);
  if ((c?.products || []).length) return toast("Vacía la categoría antes de eliminarla.", true);
  if (!confirm(`¿Eliminar categoría "${c?.nombre}"?`)) return;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return toast(error.message, true);
  toast("Categoría eliminada.");
  await load();
}

/* ------------------------------- UI utils ------------------------------- */
function wireTabs() {
  $$(".tab").forEach((t) => (t.onclick = () => {
    $$(".tab").forEach((x) => x.classList.remove("active"));
    $$(".view").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    $("#view-" + t.dataset.tab).classList.add("active");
  }));
}

let toastTimer;
function toast(msg, isErr) {
  const t = $("#toast");
  t.textContent = msg;
  t.style.background = isErr ? "rgba(255,107,107,.15)" : "rgba(62,207,142,.15)";
  t.style.borderColor = isErr ? "var(--danger)" : "var(--ok)";
  t.style.color = isErr ? "var(--danger)" : "var(--ok)";
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3500);
}
