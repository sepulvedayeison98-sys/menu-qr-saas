/* =============================================================================
 *  CONFIG DEL RESTAURANTE  —  única fuente de verdad de la plantilla.
 *  Para vender la plantilla a otro restaurante: cambia SOLO este archivo
 *  (marca, contacto, categorías, productos). El resto del sitio se adapta.
 *  Precios: enteros en COP. Se formatean en pantalla.
 * ========================================================================== */
window.RESTAURANT = {
  brand: {
    nombre: "La Burguesía",
    eslogan: "Hamburguesas de autor, cortes y sabor mexicano",
    // Paleta (coincide con la marca del seed)
    colorAcento: "#e4b343",
    colorFondo: "#0d0d0d",
    colorTexto: "#f5f5f5",
    monogram: "LB",
    menuUrl: "https://la-burguesia.lamenu.app",
  },

  contacto: {
    telefono: "+57 300 000 0000",
    whatsapp: "573000000000",
    direccion: "Cra. 00 #00-00, Tu Ciudad",
    horarios: [
      { dias: "Lun – Jue", horas: "12:00 – 22:00" },
      { dias: "Vie – Sáb", horas: "12:00 – 00:00" },
      { dias: "Domingo",   horas: "12:00 – 21:00" },
    ],
    redes: {
      instagram: "https://instagram.com/",
      facebook: "https://facebook.com/",
      tiktok: "https://tiktok.com/",
    },
    mapsEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=-74.1,4.6,-74.0,4.7&layer=mapnik",
  },

  sobreNosotros: {
    titulo: "Más que una hamburguesa",
    parrafos: [
      "Nacimos de la obsesión por el sabor: carne 100% de res a la parrilla, pan artesanal horneado a diario y salsas de la casa que no encontrarás en otro lado.",
      "Cada plato se arma al momento. Del corte premium a la tortilla de birria sellada con queso crocante, buscamos ese punto exacto entre técnica y antojo.",
    ],
    diferenciadores: [
      { icono: "🔥", titulo: "A la parrilla", texto: "Carne sellada al carbón, jugosa por dentro." },
      { icono: "🥖", titulo: "Pan artesanal", texto: "Brioche de huevo y parmesano, horneado a diario." },
      { icono: "🌶️", titulo: "Salsas de autor", texto: "Recetas propias, desde la Big Animal a la BBQ honey." },
      { icono: "⭐", titulo: "Cortes premium", texto: "Picanha, Rib Eye, New York y Solomito selectos." },
    ],
  },

  // --- MENÚ -----------------------------------------------------------------
  categorias: [
    {
      id: "hamburguesas", nombre: "Hamburguesas", icono: "🍔",
      descripcion: "Carne 100% de res a la parrilla en pan artesanal",
      productos: [
        { nombre: "Las de Siempre", precio: 27000, popular: true,
          desc: "150 g de res a la parrilla, pan de huevo y parmesano, cheddar fundido, tocineta ahumada, pepinillos, tomate y lechuga. Salsa Big Animal." },
        { nombre: "Burger Fred", precio: 35000, popular: true,
          desc: "Res (150 g) en brioche con ají negro, cheddar y tocineta, 80 g de pulled pork en salsa BBQ honey." },
        { nombre: "Rústica", precio: 35000,
          desc: "Res a la parrilla en brioche con ají negro, cheddar, tocineta y 80 g de chicharrón en reducción BBQ." },
        { nombre: "Clásica Dorada", precio: 35000,
          desc: "Pan artesanal de orégano y parmesano, cheddar, tocineta, aros de cebolla y queso mozzarella apanados." },
        { nombre: "Wagyu", precio: 42000, chef: true,
          desc: "Carne 100% wagyu, doble queso cheddar y mozzarella, tocineta ahumada y relish de pepinillos." },
      ],
    },
    {
      id: "cortes", nombre: "Cortes de Res", icono: "🥩",
      descripcion: "Servidos con ensalada y papas a la francesa",
      productos: [
        { nombre: "Punta de Anca (Picanha)", precio: 40000, popular: true, chef: true,
          desc: "Corte trasero reconocido por su jugosidad y terneza. Capa de grasa que realza el sabor." },
        { nombre: "New York Steak", precio: 40000,
          desc: "Corte premium del lomo, textura suave y jugosa, sabor magra perfectamente definido." },
        { nombre: "Solomito (Tenderloin)", precio: 40000, chef: true,
          desc: "El corte más fino y tierno de la res, valorado por su suavidad excepcional." },
        { nombre: "Rib Eye (Ojo de Bife)", precio: 40000, popular: true,
          desc: "Jugoso y lleno de sabor, de la parte alta del costillar. Marmoleo natural y aromático." },
      ],
    },
    {
      id: "mexicana", nombre: "Mexicana", icono: "🌮",
      descripcion: "Tortillas, birria y sabores tradicionales",
      productos: [
        { nombre: "Pizza Birria", precio: 40000, popular: true, chef: true,
          desc: "Dos tortillas doradas con costra de queso crocante, carne estilo birria, sour cream, cebolla y cilantro." },
        { nombre: "Quesadilla", precio: 30000,
          desc: "Tortilla de harina con carne mechada adobada y mozzarella fundido. Guacamole y frijoles refritos." },
        { nombre: "Burro", precio: 30000,
          desc: "Tortilla rellena de carne asada, guacamole, frijoles refritos, pico de gallo y sour cream." },
        { nombre: "Tacos", precio: 30000, popular: true,
          desc: "Cuatro tortillas de maíz con cerdo al pastor, cebolla, cilantro y trozos de piña." },
        { nombre: "Flautas La Burguesía", precio: 35000,
          desc: "Cinco crujientes flautas de carne sazonada, guacamole, pico de gallo, lechuga y queso." },
      ],
    },
    {
      id: "alitas", nombre: "Alitas", icono: "🍗",
      descripcion: "Crocantes por fuera, jugosas por dentro",
      productos: [
        { nombre: "Combo 7 Alitas", precio: 28000,
          desc: "Siete alitas crocantes bañadas en la salsa de tu elección." },
        { nombre: "Combo 14 Alitas", precio: 50000, popular: true,
          desc: "Catorce alitas crocantes por fuera y jugosas por dentro, salsa a elección." },
        { nombre: "Combo 21 Alitas", precio: 75000,
          desc: "Veintiuna alitas en su punto, con generosa porción de salsa a elección." },
        { nombre: "Combo 30 Alitas", precio: 95000, popular: true,
          desc: "Treinta alitas en su punto perfecto, ideal para compartir en familia." },
        { nombre: "Alitas & Boneless", precio: 50000, chef: true,
          desc: "7 alitas y 7 boneless crujientes con papas a la francesa y salsas especiales." },
      ],
    },
    {
      id: "gorditas", nombre: "Gorditas", icono: "🫓",
      descripcion: "Especialidad de la casa",
      productos: [
        { nombre: "Gorditas de Pulled Pork", precio: 35000, popular: true, chef: true,
          desc: "Gorditas rellenas de mozzarella derretido, coronadas con pulled pork, guacamole, pico de gallo y pimentón salteado." },
      ],
    },
    {
      id: "bebidas", nombre: "Bebidas", icono: "🥤",
      descripcion: "Cervezas, gaseosas, jugos, limonadas y sodas",
      productos: [
        { nombre: "Cerveza nacional", precio: 5000,  desc: "Pilsen, Águila, Club Colombia, Costeñita." },
        { nombre: "Cerveza importada", precio: 8000,  desc: "Corona, Stella Artois, Modelo." },
        { nombre: "Gaseosa", precio: 4000,  desc: "Coca-Cola, Postobón, Bretaña y más." },
        { nombre: "Jugo natural", precio: 10000, desc: "Guanábana, lulo, mango, maracuyá, mora y más." },
        { nombre: "Limonada", precio: 10000, desc: "Natural, mango biche, hierbabuena, coco, cereza, sandía." },
        { nombre: "Soda saborizada", precio: 10000, desc: "Tamarindo, limón mango biche, limón sandía, frutos rojos." },
        { nombre: "Michelada", precio: 7000,  desc: "Preparada con tu cerveza." },
        { nombre: "Agua", precio: 4000,  desc: "Manantial / Cristal." },
      ],
    },
  ],

  testimonios: [
    { nombre: "Camila R.", estrellas: 5, texto: "La Pizza Birria es otra cosa. El queso crocante por fuera me voló la cabeza." },
    { nombre: "Andrés M.", estrellas: 5, texto: "La Wagyu vale cada peso. Jugosa, bien armada y el pan increíble." },
    { nombre: "Valentina G.", estrellas: 5, texto: "Pedimos el combo de 30 alitas para compartir. Salsas brutales, repetimos seguro." },
  ],
};
