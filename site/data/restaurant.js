/* =============================================================================
 *  CONFIG DEL RESTAURANTE  —  única fuente de verdad de la plantilla.
 *  La Cafeleta — menú digital de cafetería que se abre al escanear el QR.
 *  Para rebrandear: edita SOLO este archivo. El sitio y el QR se adaptan.
 *  Precios: enteros en COP. Se formatean en pantalla ($7.000).
 * ========================================================================== */
window.RESTAURANT = {
  brand: {
    nombre: "La Cafeleta",
    tagline: "Café Colombiano Premium",
    monogram: "LC",
    variant: "dark",                // "dark" (negro) | "cream" (crema)
    colorAcento: "#D4AF37",         // dorado de marca (también usado por el QR)
    menuUrl: "https://la-cafeleta-menu.vercel.app",  // ← URL fija a la que apunta el QR
    footnote: "© 2026 LA CAFELETA · TRADICIÓN COLOMBIANA",
  },

  // --- CARTA: lista única de bebidas ----------------------------------------
  bebidas: [
    { nombre: "Frappuccino",          precio: 7000, desc: "Espresso batido con hielo y crema de leche.", img: "img/frappuccino.png" },
    { nombre: "Café Milenio",         precio: 8000, desc: "Espresso doble con un toque de panela." },
    { nombre: "Café Helado Pequeño",  precio: 3500, desc: "Café frío suave servido sobre hielo." },
    { nombre: "Milo Frío",            precio: 6000, desc: "Chocolate malteado helado y cremoso." },
    { nombre: "Cappuccino",           precio: 6000, desc: "Espresso coronado con espuma de leche sedosa." },
    { nombre: "Café con Leche",       precio: 3000, desc: "El equilibrio clásico de café y leche caliente." },
    { nombre: "Tinto",                precio: 1500, desc: "Café negro colombiano recién pasado." },
    { nombre: "Tinto con Amaretto",   precio: 3000, desc: "Tinto con un licor de almendra." },
    { nombre: "Milo Caliente",        precio: 4000, desc: "Chocolate malteado caliente y reconfortante." },
    { nombre: "Aromática",            precio: 1500, desc: "Infusión de frutas y hierbas naturales." },
    { nombre: "Canelazo",             precio: 5000, desc: "Bebida caliente de canela y panela, tradición andina." },
  ],
};
