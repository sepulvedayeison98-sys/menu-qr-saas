/* =============================================================================
 *  CONFIG DEL RESTAURANTE  —  única fuente de verdad de la plantilla.
 *  La Cafeleta — menú digital de cafetería que se abre al escanear el QR.
 *  Para rebrandear: edita SOLO este archivo. El sitio y el QR se adaptan.
 *  Precios: enteros en COP. Se formatean en pantalla ($7.500).
 *  Un ítem puede tener `precio` (único) o `precios` [{tam, precio}] (varios).
 *  `aperitivo: true` marca ítems con aperitivo opcional (ver R.aperitivo).
 * ========================================================================== */
window.RESTAURANT = {
  brand: {
    nombre: "La Cafeleta",
    tagline: "Café Colombiano Premium",
    monogram: "LC",
    heroImg: "img/cafeleta-cart.jpg",  // foto de fondo del hero (opcional)
    variant: "dark",                // "dark" (negro) | "cream" (crema)
    colorAcento: "#D4AF37",         // dorado de marca (también usado por el QR)
    menuUrl: "https://la-cafeleta-menu.vercel.app",  // ← URL fija a la que apunta el QR
    footnote: "© 2026 LA CAFELETA · TRADICIÓN COLOMBIANA",
  },

  // Texto de la nota al pie del menú (ítems marcados con *)
  aperitivo: "crema de whisky, crema de café, amareto o crema irlandesa",

  // --- CARTA por categorías -------------------------------------------------
  categorias: [
    {
      nombre: "Calientes",
      items: [
        { nombre: "Tinto", precio: 1500, img: "img/tinto.jpg", desc: "Café negro colombiano recién pasado." },
        { nombre: "Tinto con Amareto", precio: 3500, img: "img/tinto-amareto.jpg", desc: "Tinto con un toque de licor de almendra." },
        { nombre: "Long Black", precio: 2500, img: "img/long-black.jpg", desc: "Tinto largo, alargado con agua caliente." },
        { nombre: "Aromática", precio: 1500, img: "img/aromatica.jpg", desc: "Infusión de frutas y hierbas naturales." },
        { nombre: "Canelita", precio: 2000, desc: "Aromática de canela en leche." },
        { nombre: "Capuchino", precio: 6000, aperitivo: true, img: "img/capuchino.jpg", desc: "Café con leche caliente, un toque de esencia de vainilla y un aperitivo al gusto." },
        { nombre: "Milo Caliente", precios: [{ tam: "9 oz", precio: 4000 }, { tam: "12 oz", precio: 6000 }], img: "img/milo-caliente.jpg" },
        { nombre: "Canelazo", precio: 5000, img: "img/canelazo.jpg", desc: "Amareto, canela y leche dulce." },
        { nombre: "Café con Leche (perico)", precio: 2800, img: "img/cafe-con-leche.jpg", desc: "El equilibrio clásico de café y leche caliente." },
      ],
    },
    {
      nombre: "Fríos",
      items: [
        { nombre: "Frappuccino / Granizado", precio: 7500, aperitivo: true, img: "img/frappuccino.jpg", desc: "Café frío con aperitivo al gusto." },
        { nombre: "Café Milenio", precio: 8500, aperitivo: true, img: "img/cafe-milenio.jpg", desc: "Café helado con chantillí." },
        { nombre: "Milo Frío", precios: [{ tam: "9 oz", precio: 4000 }, { tam: "14 oz", precio: 6500 }], img: "img/milo-frio.jpg" },
        { nombre: "Ice Coffee con Leche", precio: 7000, img: "img/ice-coffee.jpg", desc: "Café frío con leche servido sobre hielo." },
        { nombre: "Ice Coffee Negro", precio: 3000, img: "img/ice-coffee-negro.jpg", desc: "Café frío negro servido sobre hielo." },
      ],
    },
    {
      nombre: "Snacks",
      items: [
        { nombre: "Pandequeso", precio: 2000, desc: "Pan de queso horneado, esponjoso." },
        { nombre: "Almojábana", precio: 2000, desc: "Panecillo de queso, suave y caliente." },
        { nombre: "Alfajor", precio: 800, desc: "Galletas unidas con arequipe." },
        { nombre: "Porción de Torta", precio: 2500, desc: "Consulta el sabor del día." },
      ],
    },
  ],
};
