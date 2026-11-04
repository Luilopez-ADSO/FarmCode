/* ==========================================================
   lessons_web.js — Cursos de HTML, CSS y JavaScript
   Mismo formato que lessons.js (learn / exercise / quiz).
   HTML  → el editor tiene el HTML; la vista previa muestra la página.
   CSS   → el editor tiene el CSS; el HTML de la página va fijo (step.html).
   JS    → se ejecuta en un Worker; console.log es la salida.
   Comprobación (campo "check"):
     HTML/CSS: html (reglas con selectores), css (estilos calculados),
               requires, custom({doc, win, code})
     JS:       igual que Python (stdout, vars, types, variants, cases...)
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const L = (...lines) => lines.join("\n");
    const lt = s => s; // (solo para legibilidad: los < > van escritos como &lt; &gt; en los textos)

    /* =====================================================
       CURSO HTML — Taller de Construcción
       ===================================================== */
    const HTML = {
        id: "html", name: "Taller de Construcción HTML", short: "HTML", icon: "brick", minLevel: 2, lang: "html", area: "html",
        intro: "HTML es el lenguaje con el que se construyen las páginas web, como una casa se construye con ladrillos. Cada lección que completes agrega una parte a la casa del Taller de Construcción.",
        lessons: [
            {
                id: "h1", icon: "brick", title: "Tu primera etiqueta", short: "Títulos y párrafos", blurb: "Construye los primeros ladrillos de una página.", xp: 30, reward: { coins: 10 },
                steps: [
                    {
                        type: "learn", title: "Las páginas se construyen con etiquetas",
                        paras: [
                            "Una página web se construye con <b>HTML</b>, como una casa se construye con ladrillos. Cada «ladrillo» es una <b>etiqueta</b>.",
                            "Una etiqueta se escribe entre <code>&lt;</code> y <code>&gt;</code>. Casi todas tienen una <b>apertura</b> y un <b>cierre</b> (con una barra <code>/</code>) y el contenido va en medio: <code>&lt;h1&gt;Hola&lt;/h1&gt;</code>.",
                            "<code>&lt;h1&gt;</code> es el título principal y <code>&lt;p&gt;</code> es un párrafo. El navegador lee las etiquetas y dibuja la página."
                        ],
                        code: L("<h1>Mi granja</h1>", "<p>Aquí cultivo zanahorias.</p>"),
                        note: "Cambia el texto y pulsa <b>Ver mi página</b>. ¡Las etiquetas no se ven, solo su resultado!"
                    },
                    {
                        type: "exercise", id: "e1", title: "Pon un título", concept: "La etiqueta h1", xp: 10,
                        goal: "Escribe un título principal con la etiqueta <code>&lt;h1&gt;</code> que diga <b>Mi granja</b>.",
                        starter: "<!-- Escribe tu título aquí -->\n",
                        hints: ["Empieza con la etiqueta de apertura: <h1>", "Después escribe el texto y cierra con </h1>", "<h1>Mi granja</h1>"],
                        check: { html: [{ sel: "h1", text: "Mi granja" }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Título y párrafo", concept: "La etiqueta p", xp: 10,
                        goal: "Agrega un título <code>&lt;h1&gt;</code> que diga <b>Mi granja</b> y, debajo, un párrafo <code>&lt;p&gt;</code> que cuente qué cultivas (de al menos 10 letras).",
                        starter: "<!-- Escribe el título y el párrafo -->\n",
                        hints: ["Necesitas dos etiquetas: una <h1> y una <p>.", "El párrafo va con <p> al inicio y </p> al final.", "<h1>Mi granja</h1>\n<p>Cultivo zanahorias y tomates.</p>"],
                        check: { html: [{ sel: "h1", text: "Mi granja" }, { sel: "p", minLen: 10 }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué etiqueta crea el título principal de una página?",
                        options: ["<p>", "<h1>", "<b>"], answer: 1, explain: "¡Exacto! <h1> es el título principal; <p> es un párrafo."
                    }
                ]
            },
            {
                id: "h2", icon: "tomato", title: "Listas y texto con énfasis", short: "ul, li, strong, em", blurb: "Organiza ideas y resalta lo importante.", xp: 30, reward: { seeds: { carrot: 2 } },
                steps: [
                    {
                        type: "learn", title: "Listas y resaltados",
                        paras: [
                            "Una lista con viñetas se escribe con <code>&lt;ul&gt;</code> y cada elemento va dentro de un <code>&lt;li&gt;</code>. Si quieres una lista numerada usa <code>&lt;ol&gt;</code>.",
                            "Para resaltar texto: <code>&lt;strong&gt;</code> lo pone en <b>negrita</b> (importante) y <code>&lt;em&gt;</code> en <i>cursiva</i> (énfasis).",
                            "Las etiquetas pueden ir <b>dentro</b> de otras. A eso se le llama <b>anidar</b>: el <code>&lt;li&gt;</code> está dentro del <code>&lt;ul&gt;</code>."
                        ],
                        code: L("<h2>Mis cultivos</h2>", "<ul>", "  <li>Zanahoria</li>", "  <li>Tomate</li>", "</ul>", "<p>Riega <strong>todos los días</strong> y <em>con cariño</em>.</p>"),
                        note: "Añade otro <b>&lt;li&gt;</b> a la lista y mira cómo aparece."
                    },
                    {
                        type: "exercise", id: "e1", title: "Lista de cultivos", concept: "ul y li", xp: 10,
                        goal: "Crea una lista con viñetas (<code>&lt;ul&gt;</code>) con tres elementos <code>&lt;li&gt;</code>: <b>zanahoria</b>, <b>tomate</b> y <b>calabaza</b>.",
                        starter: "<!-- Crea tu lista aquí -->\n",
                        hints: ["La lista completa va dentro de <ul> ... </ul>.", "Cada cultivo va en su propio <li>...</li>.", "<ul>\n  <li>Zanahoria</li>\n  <li>Tomate</li>\n  <li>Calabaza</li>\n</ul>"],
                        check: { html: [{ sel: "ul > li", min: 3 }, { sel: "li", text: "zanahoria" }, { sel: "li", text: "tomate" }, { sel: "li", text: "calabaza" }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Resalta lo importante", concept: "strong y em", xp: 10,
                        goal: "Dentro del párrafo, pon la palabra <b>regar</b> en negrita con <code>&lt;strong&gt;</code> y la palabra <b>ocho</b> en cursiva con <code>&lt;em&gt;</code>.",
                        starter: "<p>Recuerda regar las plantas antes de las ocho.</p>",
                        hints: ["Rodea solo la palabra con la etiqueta: <strong>regar</strong>", "Haz lo mismo con ocho usando <em>...</em>", "<p>Recuerda <strong>regar</strong> las plantas antes de las <em>ocho</em>.</p>"],
                        check: { html: [{ sel: "p strong", text: "regar" }, { sel: "p em", text: "ocho" }, { sel: "p", text: "plantas" }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué etiqueta va dentro de <ul> para cada elemento de la lista?",
                        options: ["<li>", "<p>", "<item>"], answer: 0, explain: "Cada elemento de una lista va dentro de un <li>."
                    }
                ]
            },
            {
                id: "h3", icon: "star", title: "Enlaces e imágenes", short: "a, img y atributos", blurb: "Conecta páginas y agrega dibujos.", xp: 35, reward: { coins: 10 },
                steps: [
                    {
                        type: "learn", title: "Atributos: nombre=\"valor\"",
                        paras: [
                            "Un enlace usa <code>&lt;a&gt;</code> y una imagen usa <code>&lt;img&gt;</code>. Ambas necesitan <b>atributos</b>: datos extra que se escriben dentro de la etiqueta de apertura, como <code>nombre=\"valor\"</code>.",
                            "• <code>href</code> es la dirección a la que lleva el enlace.<br>• <code>src</code> es el archivo de la imagen.<br>• <code>alt</code> es una descripción de la imagen en texto (¡importante para quien no puede verla!)."
                        ],
                        code: L("<p>Visita <a href=\"https://es.wikipedia.org/wiki/Zanahoria\">esta página</a>.</p>", "<img src=\"zanahoria.png\" alt=\"Una zanahoria fresca\">"),
                        note: "Por seguridad, el taller no abre enlaces ni carga imágenes de internet: por eso en lugar de la imagen verás su texto <b>alt</b>."
                    },
                    {
                        type: "exercise", id: "e1", title: "Un enlace", concept: "La etiqueta a", xp: 10,
                        goal: "Crea un enlace <code>&lt;a&gt;</code> con el texto <b>Mi blog</b> que apunte a <code>https://ejemplo.com</code> (el <code>href</code> debe empezar por <code>https://</code>).",
                        starter: "<!-- Escribe tu enlace -->\n",
                        hints: ["La etiqueta es <a>, y el texto del enlace va en medio.", "La dirección va en el atributo href=\"...\" dentro de la apertura.", "<a href=\"https://ejemplo.com\">Mi blog</a>"],
                        check: { html: [{ sel: "a", text: "Mi blog", attr: { href: /^https:\/\//i } }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Una imagen con descripción", concept: "La etiqueta img", xp: 15,
                        goal: "Agrega una imagen <code>&lt;img&gt;</code> con <code>src=\"tomate.png\"</code> y un <code>alt</code> que diga <b>Un tomate rojo</b>. (Recuerda: <code>&lt;img&gt;</code> no lleva etiqueta de cierre.)",
                        starter: "<!-- Escribe tu imagen -->\n",
                        hints: ["La etiqueta es <img> y lleva dos atributos.", "src=\"tomate.png\" alt=\"...\"", "<img src=\"tomate.png\" alt=\"Un tomate rojo\">"],
                        check: { html: [{ sel: "img", attr: { src: /tomate\.png$/i, alt: /tomate/i } }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Para qué sirve el atributo alt de una imagen?",
                        options: ["Para cambiar su tamaño", "Para describirla con texto", "Para que cargue más rápido"], answer: 1, explain: "alt describe la imagen con palabras: ayuda a quien no puede verla y se muestra si la imagen no carga."
                    }
                ]
            },
            {
                id: "h4", icon: "bag", title: "Estructura de la página", short: "header, main, footer, section", blurb: "Ordena tu página en zonas con significado.", xp: 40, reward: { seeds: { tomato: 2 } },
                steps: [
                    {
                        type: "learn", title: "Zonas de una página",
                        paras: [
                            "Las páginas se ordenan en zonas con etiquetas que dicen para qué sirve cada una:",
                            "• <code>&lt;header&gt;</code>: la cabecera (título y logo).<br>• <code>&lt;main&gt;</code>: el contenido principal.<br>• <code>&lt;section&gt;</code>: un apartado dentro del contenido.<br>• <code>&lt;footer&gt;</code>: el pie de página.",
                            "Una página bien ordenada es más fácil de leer, de mantener y de entender para los buscadores y los lectores de pantalla."
                        ],
                        code: L("<header>", "  <h1>Mi granja</h1>", "</header>", "<main>", "  <p>Bienvenido a mi granja.</p>", "</main>", "<footer>", "  <p>Hecho con Farm Code</p>", "</footer>"),
                        note: "Fíjate en la sangría (los espacios al inicio): ayuda a ver qué etiqueta está dentro de cuál."
                    },
                    {
                        type: "exercise", id: "e1", title: "Arma la estructura", concept: "header, main y footer", xp: 15,
                        goal: "Crea un <code>&lt;header&gt;</code> con un <code>&lt;h1&gt;</code>, un <code>&lt;main&gt;</code> con un <code>&lt;p&gt;</code> y un <code>&lt;footer&gt;</code> con algo de texto.",
                        starter: L("<!-- Arma las tres zonas -->", ""),
                        hints: ["Necesitas tres etiquetas grandes: header, main y footer.", "Dentro de cada una pon su contenido: h1, p y texto.", "<header>\n  <h1>Mi granja</h1>\n</header>\n<main>\n  <p>Bienvenido.</p>\n</main>\n<footer>Hecho con cariño</footer>"],
                        check: { html: [{ sel: "header h1" }, { sel: "main p" }, { sel: "footer", minLen: 3 }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Dos secciones", concept: "section", xp: 15,
                        goal: "Dentro de <code>&lt;main&gt;</code> crea <b>dos</b> <code>&lt;section&gt;</code>. Cada una debe tener un título <code>&lt;h2&gt;</code> y un párrafo <code>&lt;p&gt;</code>.",
                        starter: L("<main>", "  <!-- Escribe tus dos secciones -->", "</main>"),
                        hints: ["Repite la misma idea dos veces: <section> con su h2 y su p.", "Las dos secciones van una detrás de otra, dentro de <main>.", "<main>\n  <section>\n    <h2>Zanahorias</h2>\n    <p>Crecen rápido.</p>\n  </section>\n  <section>\n    <h2>Tomates</h2>\n    <p>Les encanta el sol.</p>\n  </section>\n</main>"],
                        check: { html: [{ sel: "main > section", min: 2 }, { sel: "main > section > h2", min: 2 }, { sel: "main > section > p", min: 2 }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿En qué etiqueta va el contenido principal de la página?",
                        options: ["<header>", "<main>", "<footer>"], answer: 1, explain: "<main> guarda el contenido principal; <header> la cabecera y <footer> el pie."
                    }
                ]
            },
            {
                id: "h5", icon: "trophy", title: "Proyecto: tu página completa", short: "Documento y proyecto final", blurb: "Termina la casa: crea la página de tu granja.", xp: 60, reward: { coins: 25 },
                steps: [
                    {
                        type: "learn", title: "El documento completo",
                        paras: [
                            "Una página web completa tiene siempre la misma estructura:",
                            "• <code>&lt;!DOCTYPE html&gt;</code> le dice al navegador que es HTML moderno.<br>• <code>&lt;html lang=\"es\"&gt;</code> envuelve todo e indica el idioma.<br>• <code>&lt;head&gt;</code> guarda información que no se ve en la página, como el <code>&lt;title&gt;</code> (el nombre de la pestaña).<br>• <code>&lt;body&gt;</code> guarda todo lo que sí se ve."
                        ],
                        code: L("<!DOCTYPE html>", "<html lang=\"es\">", "  <head>", "    <meta charset=\"UTF-8\">", "    <title>Mi granja</title>", "  </head>", "  <body>", "    <h1>Mi granja</h1>", "    <p>¡Bienvenido!</p>", "  </body>", "</html>"),
                        note: "Hasta ahora solo escribías lo que va dentro de <b>body</b>; el taller añadía el resto por ti."
                    },
                    {
                        type: "exercise", id: "e1", title: "El documento completo", concept: "html, head, title y body", xp: 15,
                        goal: "Escribe una página completa: con <code>&lt;!DOCTYPE html&gt;</code>, un <code>&lt;head&gt;</code> con un <code>&lt;title&gt;</code> que diga <b>Mi granja</b> y un <code>&lt;body&gt;</code> con un <code>&lt;h1&gt;</code> y un <code>&lt;p&gt;</code>.",
                        starter: L("<!DOCTYPE html>", "<html lang=\"es\">", "  <head>", "    <!-- título de la pestaña -->", "  </head>", "  <body>", "    <!-- contenido visible -->", "  </body>", "</html>"),
                        hints: ["El título va dentro de <head>: <title>Mi granja</title>", "El h1 y el p van dentro de <body>.", "<head>\n  <title>Mi granja</title>\n</head>\n<body>\n  <h1>Mi granja</h1>\n  <p>Hola</p>\n</body>"],
                        check: { requires: [{ re: /<!doctype html>/i, msg: "Empieza el documento con <!DOCTYPE html>." }], html: [{ sel: "html > head > title", text: "Mi granja" }, { sel: "html > body > h1" }, { sel: "html > body > p" }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "La página de tu granja", concept: "Todo junto", xp: 25,
                        goal: "¡El proyecto final! Crea la página de tu granja con: un <code>&lt;header&gt;</code> con <code>&lt;h1&gt;</code>; un <code>&lt;main&gt;</code> con una lista <code>&lt;ul&gt;</code> de al menos <b>3</b> <code>&lt;li&gt;</code>, una imagen <code>&lt;img&gt;</code> con <code>alt</code> y un enlace <code>&lt;a&gt;</code> con <code>href</code>; y un <code>&lt;footer&gt;</code> con texto.",
                        starter: L("<header>", "  <!-- título -->", "</header>", "<main>", "  <!-- lista, imagen y enlace -->", "</main>", "<footer>", "  <!-- texto -->", "</footer>"),
                        hints: ["Rellena cada zona: header, main y footer.", "Dentro de main: <ul> con tres <li>, un <img src=\"...\" alt=\"...\"> y un <a href=\"...\">...</a>.", "<header><h1>Mi granja</h1></header>\n<main>\n  <ul><li>Zanahoria</li><li>Tomate</li><li>Calabaza</li></ul>\n  <img src=\"granja.png\" alt=\"Mi granja\">\n  <a href=\"https://ejemplo.com\">Visítanos</a>\n</main>\n<footer>Hecho con Farm Code</footer>"],
                        check: { html: [{ sel: "header h1", minLen: 2 }, { sel: "main ul > li", min: 3 }, { sel: "main img", attr: { alt: /\S/, src: /\S/ } }, { sel: "main a", attr: { href: /\S/ }, minLen: 2 }, { sel: "footer", minLen: 3 }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué etiqueta guarda el nombre que aparece en la pestaña del navegador?",
                        options: ["<title>", "<h1>", "<body>"], answer: 0, explain: "<title>, dentro de <head>, es el nombre de la pestaña."
                    }
                ]
            }
        ]
    };

    /* =====================================================
       CURSO CSS — Invernadero
       ===================================================== */
    const CSS = {
        id: "css", name: "Invernadero CSS", short: "CSS", icon: "brush", minLevel: 3, lang: "css", area: "css",
        intro: "CSS les da colores, tamaños y estilo a las páginas. En cada lección el HTML ya está hecho y tú escribes solo el CSS. Cada lección que completes pinta y hace florecer las macetas del Invernadero.",
        lessons: [
            {
                id: "c1", icon: "brush", title: "Colores y texto", short: "color y font-size", blurb: "Dale color y tamaño a tus letras.", xp: 35, reward: { coins: 10 },
                steps: [
                    {
                        type: "learn", title: "Una regla de CSS", html: L("<h1>Mi granja</h1>", "<p>Aquí cultivo zanahorias.</p>"),
                        paras: [
                            "CSS está hecho de <b>reglas</b>. Cada regla dice <b>a qué</b> elementos se aplica (el <b>selector</b>) y <b>cómo</b> se ven (las <b>propiedades</b>):",
                            "<code>selector { propiedad: valor; }</code>",
                            "Aquí <code>h1</code> es el selector, <code>color</code> y <code>font-size</code> son propiedades. Los colores pueden ser nombres (<code>green</code>) o códigos hexadecimales (<code>#4caf50</code>), y los tamaños se miden en <code>px</code> (píxeles)."
                        ],
                        code: L("h1 {", "  color: green;", "  font-size: 32px;", "}"),
                        note: "Prueba con otros colores: <b>tomato</b>, <b>#3d7ab8</b>, <b>purple</b>. No olvides el punto y coma (;) al final de cada línea."
                    },
                    {
                        type: "exercise", id: "e1", title: "Título verde", concept: "La propiedad color", xp: 10, html: L("<h1>Mi granja</h1>", "<p>Aquí cultivo zanahorias.</p>"),
                        goal: "Haz que el título (<code>h1</code>) tenga color <b>green</b>.",
                        starter: L("h1 {", "  ", "}"),
                        hints: ["Dentro de las llaves va: propiedad: valor;", "La propiedad que cambia el color de las letras es color.", "h1 {\n  color: green;\n}"],
                        check: { css: [{ sel: "h1", prop: "color", value: "green" }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Tamaño y color", concept: "font-size", xp: 10, html: L("<h1>Mi granja</h1>", "<p>Aquí cultivo zanahorias.</p>"),
                        goal: "Haz que el párrafo (<code>p</code>) tenga letra de <b>22px</b> y color <b>#d9453a</b>.",
                        starter: L("p {", "  ", "}"),
                        hints: ["Necesitas dos propiedades dentro de las llaves.", "font-size: 22px;  y  color: #d9453a;", "p {\n  font-size: 22px;\n  color: #d9453a;\n}"],
                        check: { css: [{ sel: "p", prop: "font-size", value: "22px" }, { sel: "p", prop: "color", value: "#d9453a" }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué propiedad cambia el color de las letras?",
                        options: ["font-size", "color", "background"], answer: 1, explain: "color cambia el color del texto. font-size cambia su tamaño."
                    }
                ]
            },
            {
                id: "c2", icon: "tomato", title: "Selectores: clases e ids", short: ".clase y #id", blurb: "Elige exactamente a quién darle estilo.", xp: 35, reward: { seeds: { carrot: 2 } },
                steps: [
                    {
                        type: "learn", title: "Elegir elementos", html: L("<p>Riega las plantas.</p>", "<p class=\"importante\">¡Cosecha hoy!</p>", "<h2 id=\"titulo\">Tareas</h2>"),
                        paras: [
                            "Hay tres formas principales de elegir elementos:",
                            "• <b>Por etiqueta:</b> <code>p { ... }</code> afecta a todos los párrafos.<br>• <b>Por clase:</b> <code>.importante { ... }</code> afecta a todo lo que tenga <code>class=\"importante\"</code>. ¡Una clase se puede usar muchas veces!<br>• <b>Por id:</b> <code>#titulo { ... }</code> afecta al único elemento con <code>id=\"titulo\"</code>."
                        ],
                        code: L(".importante {", "  color: red;", "  font-weight: bold;", "}", "#titulo {", "  color: blue;", "}"),
                        note: "<b>font-weight: bold</b> pone el texto en negrita. Mira cómo solo cambia lo que elegiste."
                    },
                    {
                        type: "exercise", id: "e1", title: "Una clase", concept: "Selector de clase", xp: 10, html: L("<p>Riega las plantas.</p>", "<p class=\"importante\">¡Cosecha hoy!</p>", "<p>Vende en el mercado.</p>"),
                        goal: "Solo el párrafo con la clase <code>importante</code> debe ir en <b>negrita</b> y con color <b>#d9453a</b>. Los otros párrafos no deben cambiar.",
                        starter: L(".importante {", "  ", "}"),
                        hints: ["El selector de una clase empieza con un punto: .importante", "Usa font-weight: bold; y color: #d9453a;", ".importante {\n  font-weight: bold;\n  color: #d9453a;\n}"],
                        check: { requires: [{ re: /\.importante\s*\{/, msg: "Usa el selector de clase: .importante { ... }" }], css: [{ sel: ".importante", prop: "font-weight", value: "bold" }, { sel: ".importante", prop: "color", value: "#d9453a" }, { sel: "p:first-child", prop: "font-weight", value: "normal", message: "Solo el párrafo con la clase importante debe cambiar. Los demás deben quedar normales." }, { sel: "p:last-child", prop: "color", value: (got) => got !== "rgb(217, 69, 58)", message: "Solo el párrafo con la clase importante debe cambiar de color." }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Un id", concept: "Selector de id", xp: 10, html: L("<h1 id=\"titulo\">Mi granja</h1>", "<h2>Cultivos</h2>"),
                        goal: "El elemento con el id <code>titulo</code> debe estar <b>centrado</b> (<code>text-align: center</code>) y con color <b>#3d7ab8</b>. El h2 no debe cambiar de color.",
                        starter: L("#titulo {", "  ", "}"),
                        hints: ["El selector de un id empieza con una almohadilla: #titulo", "text-align: center; y color: #3d7ab8;", "#titulo {\n  text-align: center;\n  color: #3d7ab8;\n}"],
                        check: { requires: [{ re: /#titulo\s*\{/, msg: "Usa el selector de id: #titulo { ... }" }], css: [{ sel: "#titulo", prop: "text-align", value: "center" }, { sel: "#titulo", prop: "color", value: "#3d7ab8" }, { sel: "h2", prop: "color", value: (got) => got !== "rgb(61, 122, 184)", message: "Solo el elemento con id titulo debe cambiar de color." }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Cómo se escribe el selector de la clase «aviso»?",
                        options: [".aviso", "#aviso", "aviso."], answer: 0, explain: "Las clases empiezan con un punto (.aviso) y los ids con almohadilla (#aviso)."
                    }
                ]
            },
            {
                id: "c3", icon: "bag", title: "La caja de cada elemento", short: "padding, border y margin", blurb: "Todo elemento es una caja: dale espacio y bordes.", xp: 40, reward: { coins: 15 },
                steps: [
                    {
                        type: "learn", title: "El modelo de caja", html: "<div class=\"tarjeta\">Zanahoria</div>",
                        paras: [
                            "Todo elemento de una página es una <b>caja</b> con varias capas, de adentro hacia afuera:",
                            "• <b>Contenido</b>: el texto o la imagen.<br>• <b><code>padding</code></b>: espacio <i>dentro</i> de la caja, alrededor del contenido.<br>• <b><code>border</code></b>: el borde.<br>• <b><code>margin</code></b>: espacio <i>fuera</i> de la caja, que la separa de las demás."
                        ],
                        code: L(".tarjeta {", "  padding: 16px;", "  border: 3px solid green;", "  margin: 20px;", "}"),
                        note: "<b>border: 3px solid green</b> significa: grosor, estilo (solid = línea continua) y color."
                    },
                    {
                        type: "exercise", id: "e1", title: "Tarjeta con borde", concept: "padding y border", xp: 10, html: "<div class=\"tarjeta\">Zanahoria</div>",
                        goal: "Dale a la tarjeta (<code>.tarjeta</code>) un relleno <code>padding</code> de <b>20px</b> y un borde <b>sólido</b> de <b>3px</b> (del color que quieras).",
                        starter: L(".tarjeta {", "  ", "}"),
                        hints: ["Necesitas dos propiedades: padding y border.", "padding: 20px;  y  border: 3px solid ...;", ".tarjeta {\n  padding: 20px;\n  border: 3px solid green;\n}"],
                        check: { css: [{ sel: ".tarjeta", prop: "padding-top", value: "20px" }, { sel: ".tarjeta", prop: "border-top-width", value: "3px" }, { sel: ".tarjeta", prop: "border-top-style", value: "solid" }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Espacio y fondo", concept: "margin y background-color", xp: 15, html: L("<div class=\"tarjeta\">Zanahoria</div>", "<div class=\"tarjeta\">Tomate</div>"),
                        goal: "Pon a las tarjetas un fondo (<code>background-color</code>) de <b>#fff3b0</b> y un margen inferior (<code>margin-bottom</code>) de <b>16px</b> para separarlas.",
                        starter: L(".tarjeta {", "  ", "}"),
                        hints: ["Dos propiedades otra vez: background-color y margin-bottom.", "background-color: #fff3b0;", ".tarjeta {\n  background-color: #fff3b0;\n  margin-bottom: 16px;\n}"],
                        check: { css: [{ sel: ".tarjeta", prop: "background-color", value: "#fff3b0" }, { sel: ".tarjeta", prop: "margin-bottom", value: "16px" }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué crea espacio DENTRO de la caja, entre el contenido y el borde?",
                        options: ["margin", "padding", "border"], answer: 1, explain: "padding es el relleno interior. margin es el espacio exterior."
                    }
                ]
            },
            {
                id: "c4", icon: "gift", title: "Fondos y formas", short: "background, border-radius, width", blurb: "Botones redondeados y formas con CSS.", xp: 40, reward: { seeds: { tomato: 2 } },
                steps: [
                    {
                        type: "learn", title: "Redondear y colorear", html: "<button class=\"boton\">Cosechar</button>",
                        paras: [
                            "Con CSS puedes dar forma a los elementos: <code>background-color</code> pone el fondo, <code>border-radius</code> redondea las esquinas y <code>width</code> / <code>height</code> fijan el ancho y el alto.",
                            "En <code>padding: 10px 20px</code> el primer valor es para arriba y abajo y el segundo para los lados."
                        ],
                        code: L(".boton {", "  background-color: #4caf50;", "  color: white;", "  border: none;", "  border-radius: 12px;", "  padding: 10px 20px;", "}"),
                        note: "Prueba <b>border-radius: 30px</b> para un botón en forma de píldora."
                    },
                    {
                        type: "exercise", id: "e1", title: "Botón redondeado", concept: "background-color y border-radius", xp: 15, html: "<button class=\"boton\">Cosechar</button>",
                        goal: "Dale al botón (<code>.boton</code>) fondo <b>#4caf50</b>, texto <b>white</b>, esquinas redondeadas de <b>12px</b> y un relleno de <b>10px</b> arriba y <b>20px</b> a los lados.",
                        starter: L(".boton {", "  ", "}"),
                        hints: ["Necesitas cuatro cosas: background-color, color, border-radius y padding.", "padding: 10px 20px;  (arriba/abajo y lados)", ".boton {\n  background-color: #4caf50;\n  color: white;\n  border-radius: 12px;\n  padding: 10px 20px;\n}"],
                        check: { css: [{ sel: ".boton", prop: "background-color", value: "#4caf50" }, { sel: ".boton", prop: "color", value: "white" }, { sel: ".boton", prop: "border-top-left-radius", value: "12px" }, { sel: ".boton", prop: "padding-top", value: "10px" }, { sel: ".boton", prop: "padding-left", value: "20px" }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Un sol", concept: "Círculos con border-radius", xp: 15, html: "<div class=\"sol\"></div>",
                        goal: "Crea un círculo amarillo: <code>.sol</code> con ancho y alto de <b>80px</b>, fondo <b>#f5d04c</b> y <code>border-radius: 50%</code>.",
                        starter: L(".sol {", "  ", "}"),
                        hints: ["Un círculo es un cuadrado con las esquinas muy redondeadas.", "width: 80px; height: 80px; border-radius: 50%;", ".sol {\n  width: 80px;\n  height: 80px;\n  background-color: #f5d04c;\n  border-radius: 50%;\n}"],
                        check: { css: [{ sel: ".sol", prop: "width", value: "80px" }, { sel: ".sol", prop: "height", value: "80px" }, { sel: ".sol", prop: "background-color", value: "#f5d04c" }, { sel: ".sol", prop: "border-top-left-radius", value: "50%" }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué propiedad redondea las esquinas de una caja?",
                        options: ["border-radius", "corner", "round"], answer: 0, explain: "border-radius redondea las esquinas. Con 50% en un cuadrado obtienes un círculo."
                    }
                ]
            },
            {
                id: "c5", icon: "trophy", title: "Diseño con flexbox", short: "display: flex y proyecto", blurb: "Ordena elementos en fila y diseña tu tarjeta.", xp: 60, reward: { coins: 25 },
                steps: [
                    {
                        type: "learn", title: "Poner cosas en fila", html: L("<div class=\"fila\">", "  <div class=\"cultivo\">Zanahoria</div>", "  <div class=\"cultivo\">Tomate</div>", "  <div class=\"cultivo\">Calabaza</div>", "</div>"),
                        paras: [
                            "Normalmente las cajas se apilan una debajo de otra. Con <code>display: flex</code> en el <b>contenedor</b>, sus hijos se colocan en <b>fila</b>.",
                            "<code>gap</code> pone espacio entre ellos y <code>justify-content</code> los alinea (por ejemplo <code>center</code> para centrarlos)."
                        ],
                        code: L(".fila {", "  display: flex;", "  gap: 12px;", "  justify-content: center;", "}", ".cultivo {", "  background-color: #f08a24;", "  padding: 10px;", "}"),
                        note: "Cambia <b>center</b> por <b>space-between</b> o <b>flex-end</b> y mira cómo se reparten."
                    },
                    {
                        type: "exercise", id: "e1", title: "Cultivos en fila", concept: "display: flex y gap", xp: 10,
                        html: L("<div class=\"fila\">", "  <div class=\"cultivo\">Zanahoria</div>", "  <div class=\"cultivo\">Tomate</div>", "  <div class=\"cultivo\">Calabaza</div>", "</div>"),
                        goal: "Usa flexbox en <code>.fila</code>: <code>display: flex</code> y un espacio (<code>gap</code>) de <b>12px</b> entre los cultivos.",
                        starter: L(".fila {", "  ", "}", ".cultivo {", "  background-color: #f08a24;", "}"),
                        hints: ["Dos propiedades dentro de .fila.", "display: flex;  y  gap: 12px;", ".fila {\n  display: flex;\n  gap: 12px;\n}"],
                        check: { css: [{ sel: ".fila", prop: "display", value: "flex" }, { sel: ".fila", prop: "column-gap", value: "12px" }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Centra todo", concept: "justify-content", xp: 10,
                        html: L("<div class=\"fila\">", "  <div class=\"cultivo\">Zanahoria</div>", "  <div class=\"cultivo\">Tomate</div>", "  <div class=\"cultivo\">Calabaza</div>", "</div>"),
                        goal: "Centra los cultivos horizontalmente con <code>justify-content: center</code> y dale a cada <code>.cultivo</code> un relleno (<code>padding</code>) de <b>10px</b>.",
                        starter: L(".fila {", "  display: flex;", "  gap: 12px;", "}", ".cultivo {", "  background-color: #f08a24;", "  ", "}"),
                        hints: ["justify-content va en .fila (el contenedor).", "El padding va en .cultivo.", ".fila {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n}\n.cultivo {\n  background-color: #f08a24;\n  padding: 10px;\n}"],
                        check: { css: [{ sel: ".fila", prop: "justify-content", value: "center" }, { sel: ".cultivo", prop: "padding-top", value: "10px" }] }
                    },
                    {
                        type: "exercise", id: "e3", title: "Proyecto: la tarjeta de tu cultivo", concept: "Todo junto", xp: 25,
                        html: L("<article class=\"tarjeta\">", "  <h2>Zanahoria</h2>", "  <p>Crece en 30 segundos.</p>", "</article>"),
                        goal: "¡Diseña la tarjeta de tu cultivo! Debe tener: relleno de al menos <b>16px</b>, esquinas redondeadas de al menos <b>8px</b>, un fondo que <b>no</b> sea transparente, un borde visible y el título <code>h2</code> de un color distinto al gris oscuro del texto normal.",
                        starter: L(".tarjeta {", "  ", "}", ".tarjeta h2 {", "  ", "}"),
                        hints: ["Combina lo aprendido: padding, border-radius, background-color y border.", "En .tarjeta h2 solo necesitas color: ...;", ".tarjeta {\n  padding: 20px;\n  border-radius: 12px;\n  background-color: #fff3b0;\n  border: 2px solid #f08a24;\n}\n.tarjeta h2 {\n  color: #d9731a;\n}"],
                        check: {
                            css: [
                                { sel: ".tarjeta", prop: "padding-top", value: v => parseFloat(v) >= 16, message: "Dale a la tarjeta un relleno (padding) de al menos 16px." },
                                { sel: ".tarjeta", prop: "border-top-left-radius", value: v => parseFloat(v) >= 8, message: "Redondea las esquinas (border-radius) al menos 8px." },
                                { sel: ".tarjeta", prop: "background-color", value: v => v !== "rgba(0, 0, 0, 0)" && v !== "transparent", message: "Ponle un color de fondo a la tarjeta (background-color)." },
                                { sel: ".tarjeta", prop: "border-top-width", value: v => parseFloat(v) > 0, message: "Dale un borde a la tarjeta (border)." },
                                { sel: ".tarjeta", prop: "border-top-style", value: v => v !== "none" && v !== "hidden", message: "El borde necesita un estilo, por ejemplo solid." },
                                { sel: ".tarjeta h2", prop: "color", value: v => v !== "rgb(34, 34, 34)" && v !== "rgb(0, 0, 0)", message: "Cambia el color (color) del título h2." }
                            ]
                        }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué hace  display: flex  en un contenedor?",
                        options: ["Oculta el contenedor", "Coloca a sus hijos en fila y permite alinearlos", "Agranda la letra"], answer: 1, explain: "Flexbox acomoda a los hijos en fila (o columna) y te deja alinearlos y separarlos fácilmente."
                    }
                ]
            }
        ]
    };

    /* =====================================================
       CURSO JAVASCRIPT — Campo de Máquinas
       ===================================================== */
    const JS = {
        id: "js", name: "Campo de Máquinas JavaScript", short: "JavaScript", icon: "gear", minLevel: 4, lang: "js", area: "js",
        intro: "JavaScript es el lenguaje que le da cerebro a las páginas web. Si ya conoces Python, verás que las ideas son las mismas con otra forma de escribirlas. Cada lección que completes enciende una máquina del Campo.",
        lessons: [
            {
                id: "j1", icon: "gear", title: "Variables y console.log", short: "let, const y console.log", blurb: "Guarda datos y muéstralos en JavaScript.", xp: 40, reward: { coins: 10 },
                steps: [
                    {
                        type: "learn", title: "Tu primera variable en JavaScript", visual: "vars",
                        paras: [
                            "En JavaScript las variables se crean con <code>let</code> (si su valor va a cambiar) o con <code>const</code> (si no va a cambiar). Cada instrucción termina con punto y coma <code>;</code>.",
                            "<code>console.log(...)</code> muestra algo en pantalla, igual que <code>print</code> en Python."
                        ],
                        code: L("let semillas = 3;", "console.log(semillas);"),
                        note: "Cambia el <b>3</b> por un <b>5</b> y ejecuta de nuevo: ¡cinco semillas!"
                    },
                    {
                        type: "exercise", id: "e1", title: "Cambia el valor", concept: "Valor de una variable", xp: 10, visual: "vars",
                        goal: "Haz que el estante tenga <b>5 semillas</b>.",
                        starter: L("let semillas = 3;", "console.log(semillas);"),
                        hints: ["Mira el número después del signo =.", "Cambia el 3 por otro número en la primera línea.", "let semillas = 5;"],
                        check: { vars: { semillas: 5 }, stdout: "5" }
                    },
                    {
                        type: "learn", title: "let y const", visual: "vars",
                        paras: ["Con <code>let</code> puedes cambiar el valor más adelante. Con <code>const</code> el valor queda fijo: si intentas cambiarlo, JavaScript te avisa con un error."],
                        code: L("const cultivo = \"zanahoria\";", "let agua = 5;", "agua = 8;", "", "console.log(cultivo);", "console.log(agua);"),
                        note: "Prueba a escribir <b>cultivo = \"tomate\";</b> antes de los console.log y lee el mensaje de error."
                    },
                    {
                        type: "exercise", id: "e2", title: "Crea tus variables", concept: "let y const", xp: 10, visual: "vars",
                        goal: "Crea con <code>const</code> la variable <code>cultivo</code> con el texto <b>tomate</b> y con <code>let</code> la variable <code>agua</code> con el valor <b>8</b>. Muéstralas con <code>console.log</code>, primero <code>cultivo</code>.",
                        starter: "// Crea las variables y muéstralas\n",
                        hints: ["Los textos van entre comillas.", "const cultivo = \"tomate\";  y  let agua = 8;", "const cultivo = \"tomate\";\nlet agua = 8;\nconsole.log(cultivo);\nconsole.log(agua);"],
                        check: { vars: { cultivo: "tomate", agua: 8 }, stdout: "tomate\n8", requires: [{ re: /\bconst\s+cultivo\b/, msg: "Crea cultivo con const." }, { re: /\blet\s+agua\b/, msg: "Crea agua con let." }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué palabra crea una variable cuyo valor SÍ puede cambiar?",
                        options: ["const", "let", "print"], answer: 1, explain: "let crea variables que pueden cambiar. const las deja fijas."
                    }
                ]
            },
            {
                id: "j2", icon: "coin", title: "Tipos y operaciones", short: "números, textos y plantillas", blurb: "Haz cuentas y arma mensajes con tus datos.", xp: 40, reward: { seeds: { carrot: 2 } },
                steps: [
                    {
                        type: "learn", title: "Operaciones y plantillas", visual: "vars",
                        paras: [
                            "JavaScript tiene números (<code>3</code>, <code>2.5</code>), textos (<code>\"hola\"</code>) y booleanos (<code>true</code>, <code>false</code>, en minúscula). Las operaciones son las mismas: <code>+ - * /</code> y <code>%</code>.",
                            "Para mezclar textos y variables usa las <b>plantillas</b>: un texto entre acentos graves (<code>`</code>) donde puedes escribir <code>${variable}</code>."
                        ],
                        code: L("let semillas = 3;", "semillas = semillas + 2;", "let nombre = \"Ana\";", "", "console.log(semillas);", "console.log(`${nombre} tiene ${semillas} semillas`);", "console.log(typeof semillas);"),
                        note: "<b>typeof</b> te dice el tipo de un dato: number, string, boolean…"
                    },
                    {
                        type: "exercise", id: "e1", title: "Suma semillas", concept: "Operaciones con variables", xp: 10, visual: "vars",
                        goal: "Tienes 3 semillas y compras <b>4 más</b>. Actualiza la variable <code>semillas</code> con una suma y muestra el resultado (debe salir 7).",
                        starter: L("let semillas = 3;", "", "// Compras 4 semillas más:", "", "console.log(semillas);"),
                        hints: ["Usa la variable en la cuenta.", "semillas = semillas + ...", "semillas = semillas + 4;   (o también: semillas += 4;)"],
                        check: { vars: { semillas: 7 }, stdout: "7", requires: [{ re: /semillas\s*(\+=\s*4|=\s*semillas\s*\+\s*4|=\s*4\s*\+\s*semillas)/, msg: "Usa la variable semillas en la cuenta, por ejemplo: semillas = semillas + 4;" }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Mensaje con plantilla", concept: "Plantillas de texto", xp: 15, visual: "vars",
                        goal: "Muestra con <code>console.log</code> el mensaje <b>Ana cosechó 5 zanahorias</b> usando las variables <code>nombre</code> y <code>cosechas</code>. (Probaremos tu programa con otros valores.)",
                        starter: L("let nombre = \"Ana\";", "let cosechas = 5;", "", "// Muestra el mensaje usando las variables", ""),
                        hints: ["Usa una plantilla con acentos graves: `...`", "Dentro, las variables se escriben así: ${nombre}", "console.log(`${nombre} cosechó ${cosechas} zanahorias`);"],
                        check: { stdout: "Ana cosechó 5 zanahorias", variants: [{ set: { nombre: "\"Luis\"", cosechas: "8" }, stdout: "Luis cosechó 8 zanahorias" }, { set: { nombre: "\"Eva\"", cosechas: "10" }, stdout: "Eva cosechó 10 zanahorias" }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué muestra  console.log(\"3\" + 3)  ?",
                        options: ["6", "33", "Un error"], answer: 1, explain: "Con un texto, el + pega: \"3\" y 3 se unen y sale 33."
                    }
                ]
            },
            {
                id: "j3", icon: "check", title: "Condicionales", short: "if, else if, else, && y ||", blurb: "Enseña a tu programa a decidir.", xp: 50, reward: { coins: 15 },
                steps: [
                    {
                        type: "learn", title: "Si pasa esto, haz aquello", visual: "speech",
                        paras: [
                            "En JavaScript la condición va entre paréntesis y lo que se hace va entre llaves <code>{ }</code>.",
                            "Para comparar: <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>, <code>===</code> (igual) y <code>!==</code> (distinto). Cuidado: <code>=</code> <b>guarda</b> un valor y <code>===</code> <b>compara</b>."
                        ],
                        code: L("let semillas = 3;", "", "if (semillas > 0) {", "  console.log(\"Puedes sembrar\");", "} else {", "  console.log(\"Necesitas semillas\");", "}"),
                        note: "Cambia <b>semillas = 3</b> por <b>semillas = 0</b> y ejecuta otra vez."
                    },
                    {
                        type: "learn", title: "Varias opciones y condiciones combinadas", visual: "speech",
                        paras: ["Usa <code>else if</code> para más de dos caminos. Para combinar condiciones: <code>&amp;&amp;</code> significa «y» (las dos deben cumplirse) y <code>||</code> significa «o» (basta con una)."],
                        code: L("let agua = 4;", "let regada = true;", "", "if (agua >= 8) {", "  console.log(\"La planta está feliz\");", "} else if (agua >= 3) {", "  console.log(\"Está bien\");", "} else {", "  console.log(\"¡Tiene sed!\");", "}", "", "if (agua > 2 && regada) {", "  console.log(\"Todo en orden\");", "}"),
                        note: "Prueba con agua = 1 y con regada = false."
                    },
                    {
                        type: "exercise", id: "e1", title: "¿Puedes sembrar?", concept: "if y else", xp: 10, visual: "speech",
                        goal: "Si tienes semillas (<code>semillas &gt; 0</code>) muestra <b>Puedes sembrar</b>; si no, <b>Necesitas semillas</b>. Probaremos con varios valores.",
                        starter: L("let semillas = 0;", "", "// Escribe aquí tu if / else", ""),
                        hints: ["Empieza con: if (semillas > 0) {", "Después del cierre } escribe else { ... }", "if (semillas > 0) {\n  console.log(\"Puedes sembrar\");\n} else {\n  console.log(\"Necesitas semillas\");\n}"],
                        check: { variants: [{ set: { semillas: "0" }, stdout: "Necesitas semillas" }, { set: { semillas: "5" }, stdout: "Puedes sembrar" }, { set: { semillas: "1" }, stdout: "Puedes sembrar" }], requires: [{ re: /\bif\b/, msg: "Usa un if para decidir." }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Riego inteligente", concept: "else if", xp: 15, visual: "speech",
                        goal: "Según el <code>agua</code>: menos de 3 → <b>Necesita agua</b>; de 3 a 7 → <b>Agua perfecta</b>; más de 7 → <b>Demasiada agua</b>.",
                        starter: L("let agua = 5;", "", "// Usa if, else if y else", ""),
                        hints: ["Tres caminos: if, else if y else.", "if (agua < 3) { ... } else if (agua <= 7) { ... } else { ... }", "if (agua < 3) {\n  console.log(\"Necesita agua\");\n} else if (agua <= 7) {\n  console.log(\"Agua perfecta\");\n} else {\n  console.log(\"Demasiada agua\");\n}"],
                        check: { variants: [{ set: { agua: "1" }, stdout: "Necesita agua" }, { set: { agua: "3" }, stdout: "Agua perfecta" }, { set: { agua: "7" }, stdout: "Agua perfecta" }, { set: { agua: "8" }, stdout: "Demasiada agua" }], requires: [{ re: /\belse\s+if\b/, msg: "Usa else if para el camino del medio." }] }
                    },
                    {
                        type: "exercise", id: "e3", title: "¿Lista para cosechar?", concept: "&& (y)", xp: 15, visual: "speech",
                        goal: "Muestra <b>Lista para cosechar</b> solo si <code>dias</code> es 5 o más <b>Y</b> <code>regada</code> es <code>true</code>. En cualquier otro caso muestra <b>Todavía no</b>.",
                        starter: L("let dias = 5;", "let regada = true;", "", "// Combina las dos condiciones con &&", ""),
                        hints: ["Las dos condiciones van en el mismo if, unidas por &&.", "if (dias >= 5 && regada) { ... }", "if (dias >= 5 && regada) {\n  console.log(\"Lista para cosechar\");\n} else {\n  console.log(\"Todavía no\");\n}"],
                        check: { variants: [{ set: { dias: "5", regada: "true" }, stdout: "Lista para cosechar" }, { set: { dias: "5", regada: "false" }, stdout: "Todavía no" }, { set: { dias: "2", regada: "true" }, stdout: "Todavía no" }, { set: { dias: "9", regada: "true" }, stdout: "Lista para cosechar" }], requires: [{ re: /&&/, msg: "Combina las dos condiciones con &&." }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Cuál de estas compara dos valores?",
                        options: ["semillas = 3", "semillas === 3", "semillas => 3"], answer: 1, explain: "Tres signos === comparan. Un solo = guarda un valor."
                    }
                ]
            },
            {
                id: "j4", icon: "heart", title: "Ciclos y arreglos", short: "for, while y listas", blurb: "Repite tareas y recorre listas de datos.", xp: 50, reward: { seeds: { tomato: 2 } },
                steps: [
                    {
                        type: "learn", title: "Repetir con for", visual: "loop",
                        paras: [
                            "Un ciclo <code>for</code> tiene tres partes entre paréntesis: dónde <b>empieza</b> (<code>let i = 0</code>), hasta cuándo <b>continúa</b> (<code>i &lt; 3</code>) y cómo <b>avanza</b> (<code>i++</code>, que suma 1).",
                            "Este ciclo da 3 vueltas: con <code>i</code> valiendo 0, 1 y 2."
                        ],
                        code: L("for (let i = 0; i < 3; i++) {", "  console.log(\"Regando una planta\");", "}"),
                        note: "Mira cómo la gota cae sobre cada planta. Cambia el 3 por un 5."
                    },
                    {
                        type: "learn", title: "Arreglos y while", visual: "loop",
                        paras: [
                            "Un <b>arreglo</b> (array) guarda varios datos en una lista entre corchetes: <code>[\"a\", \"b\"]</code>. <code>.length</code> dice cuántos hay y <code>for (const x of lista)</code> los recorre uno a uno.",
                            "El ciclo <code>while</code> repite <b>mientras</b> la condición sea verdadera. ¡Dentro debe cambiar algo para que termine!"
                        ],
                        code: L("const cultivos = [\"zanahoria\", \"tomate\", \"calabaza\"];", "console.log(cultivos.length);", "for (const c of cultivos) {", "  console.log(\"Cosechando \" + c);", "}", "", "let litros = 0;", "while (litros < 3) {", "  litros++;", "  console.log(\"Litros: \" + litros);", "}"),
                        note: "<b>litros++</b> es una forma corta de <b>litros = litros + 1</b>."
                    },
                    {
                        type: "exercise", id: "e1", title: "Riega cinco plantas", concept: "for", xp: 10, visual: "loop",
                        goal: "Usa un ciclo <code>for</code> para mostrar <b>Regando una planta</b> exactamente 5 veces.",
                        starter: "// Escribe tu ciclo aquí\n",
                        hints: ["Empieza con: for (let i = 0; i < ...; i++) {", "El número después de i < es cuántas veces se repite.", "for (let i = 0; i < 5; i++) {\n  console.log(\"Regando una planta\");\n}"],
                        check: { stdout: "Regando una planta\n".repeat(5).trim(), requires: [{ re: /\bfor\b/, msg: "Usa un ciclo for en vez de escribir el console.log cinco veces." }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Suma los paquetes", concept: "Recorrer un arreglo", xp: 15, visual: "vars",
                        goal: "La lista <code>paquetes</code> tiene las semillas de cada paquete. Usa un ciclo para sumarlas todas en <code>total</code> y muéstralo. (Probaremos con otras listas.)",
                        starter: L("const paquetes = [3, 5, 2];", "let total = 0;", "", "// Recorre la lista y suma cada paquete a total", "", "console.log(total);"),
                        hints: ["Recorre la lista: for (const p of paquetes) {", "Dentro del ciclo: total = total + p;", "for (const p of paquetes) {\n  total = total + p;\n}"],
                        check: { variants: [{ set: { paquetes: "[3, 5, 2]" }, stdout: "10" }, { set: { paquetes: "[1, 1, 1, 1]" }, stdout: "4" }, { set: { paquetes: "[10]" }, stdout: "10" }, { set: { paquetes: "[7, 8, 9, 1]" }, stdout: "25" }], requires: [{ re: /\bfor\b/, msg: "Usa un ciclo for para recorrer la lista." }] }
                    },
                    {
                        type: "exercise", id: "e3", title: "Llena el balde", concept: "while", xp: 15, visual: "loop",
                        goal: "El balde está vacío. Con un ciclo <code>while</code> echa un litro cada vez hasta llegar a 5 y muestra <b>Litros: 1</b>, <b>Litros: 2</b>… hasta <b>Litros: 5</b>.",
                        starter: L("let litros = 0;", "", "// Llena el balde con un while", ""),
                        hints: ["La condición puede ser: while (litros < 5) {", "Dentro: suma 1 a litros y muestra el mensaje.", "while (litros < 5) {\n  litros++;\n  console.log(\"Litros: \" + litros);\n}"],
                        check: { stdout: "Litros: 1\nLitros: 2\nLitros: 3\nLitros: 4\nLitros: 5", vars: { litros: 5 }, requires: [{ re: /\bwhile\b/, msg: "Usa un ciclo while." }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "Si  const cultivos = [\"a\", \"b\", \"c\"] ,  ¿cuánto vale  cultivos.length  ?",
                        options: ["2", "3", "4"], answer: 1, explain: "length cuenta los elementos de la lista: hay tres."
                    }
                ]
            },
            {
                id: "j5", icon: "book", title: "Funciones", short: "function, parámetros y return", blurb: "Crea tus propias herramientas reutilizables.", xp: 50, reward: { coins: 20 },
                steps: [
                    {
                        type: "learn", title: "Tu propia herramienta", visual: "function",
                        paras: ["Una <b>función</b> agrupa instrucciones bajo un nombre. Se <b>define</b> con <code>function</code> y se <b>llama</b> escribiendo su nombre con paréntesis."],
                        code: L("function regarPlanta() {", "  console.log(\"Planta regada\");", "}", "", "regarPlanta();", "regarPlanta();"),
                        note: "La receta se escribió una vez y se usó dos veces."
                    },
                    {
                        type: "learn", title: "Parámetros, return y flechas", visual: "function",
                        paras: [
                            "Una función puede recibir datos (<b>parámetros</b>) y devolver un resultado con <code>return</code>.",
                            "También hay una forma corta, las <b>funciones flecha</b>: <code>const doble = (n) =&gt; n * 2;</code>"
                        ],
                        code: L("function totalSemillas(paquetes, porPaquete) {", "  return paquetes * porPaquete;", "}", "", "console.log(totalSemillas(3, 4));", "", "const doble = (n) => n * 2;", "console.log(doble(5));"),
                        note: "Con la misma función obtienes 12 y 10 al cambiar los datos."
                    },
                    {
                        type: "exercise", id: "e1", title: "Tu primera función", concept: "function y llamar", xp: 10, visual: "function",
                        goal: "Define una función llamada <code>cosechar</code> que muestre <b>Cosecha lista</b>. Después llámala dos veces.",
                        starter: "// Define la función y llámala dos veces\n",
                        hints: ["Empieza con: function cosechar() {", "Dentro de las llaves va el console.log.", "function cosechar() {\n  console.log(\"Cosecha lista\");\n}\n\ncosechar();\ncosechar();"],
                        check: { stdout: "Cosecha lista\nCosecha lista", requires: [{ re: /function\s+cosechar\s*\(\s*\)/, msg: "Define la función con: function cosechar() { ... }" }], cases: [{ append: "cosechar();\ncosechar();\ncosechar();", stdout: "Cosecha lista\nCosecha lista\nCosecha lista", msg: "Tu función debe mostrar «Cosecha lista» cada vez que se llama." }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Función con parámetro", concept: "Parámetros", xp: 15, visual: "function",
                        goal: "Completa <code>regar(planta)</code>: debe mostrar <b>Regando</b> y el nombre de la planta. Por ejemplo, <code>regar(\"tomate\")</code> muestra <b>Regando tomate</b>.",
                        starter: L("function regar(planta) {", "  // muestra «Regando» y el nombre de la planta", "}", "", "regar(\"zanahoria\");"),
                        hints: ["console.log acepta varios datos separados por comas.", "console.log(\"Regando\", planta);", "function regar(planta) {\n  console.log(\"Regando\", planta);\n}"],
                        check: { stdout: "Regando zanahoria", cases: [{ append: "regar(\"maíz\");", stdout: "Regando maíz" }, { append: "regar(\"calabaza\");", stdout: "Regando calabaza" }] }
                    },
                    {
                        type: "exercise", id: "e3", title: "Calcula con return", concept: "return", xp: 15, visual: "function",
                        goal: "Escribe <code>totalCosecha(plantas, frutosPorPlanta)</code> que <b>devuelva</b> cuántos frutos habrá en total. Probaremos con varios números.",
                        starter: L("function totalCosecha(plantas, frutosPorPlanta) {", "  // devuelve el total de frutos", "}", ""),
                        hints: ["El total se calcula multiplicando.", "Usa return para devolver el resultado.", "function totalCosecha(plantas, frutosPorPlanta) {\n  return plantas * frutosPorPlanta;\n}"],
                        check: { requires: [{ re: /\breturn\b/, msg: "Usa return para devolver el resultado." }], cases: [{ append: "console.log(totalCosecha(3, 4));", stdout: "12" }, { append: "console.log(totalCosecha(5, 2));", stdout: "10" }, { append: "console.log(totalCosecha(0, 9));", stdout: "0" }, { append: "console.log(totalCosecha(7, 7));", stdout: "49" }] }
                    },
                    {
                        type: "quiz", title: "Pregunta rápida", question: "¿Qué hace la palabra return dentro de una función?",
                        options: ["Repite la función", "Devuelve un resultado a quien la llamó", "Borra las variables"], answer: 1, explain: "return entrega el resultado de la función para que puedas guardarlo o mostrarlo."
                    }
                ]
            },
            {
                id: "j6", icon: "trophy", title: "Pequeños programas del campo", short: "Automatiza el campo", blurb: "Combina todo en retos de granja.", xp: 70, reward: { coins: 40 },
                steps: [
                    {
                        type: "learn", title: "Todo junto", visual: "loop",
                        paras: ["¡Hora de combinar variables, condiciones, ciclos y funciones para automatizar el campo! Este programa usa una función con un ciclo y recorre una lista:"],
                        code: L("function regarTodas(cantidad) {", "  for (let n = 1; n <= cantidad; n++) {", "    console.log(\"Regando la planta \" + n);", "  }", "}", "", "regarTodas(3);", "", "const paquetes = [3, 5, 2];", "for (const p of paquetes) {", "  console.log(\"Paquete con \" + p);", "}"),
                        note: "Cuatro herramientas trabajando juntas. ¡Ahora te toca a ti!"
                    },
                    {
                        type: "exercise", id: "e1", title: "Contar semillas", concept: "Función + ciclo", xp: 15, visual: "function",
                        goal: "Escribe <code>sumar(lista)</code>: recibe una lista de números y <b>devuelve</b> la suma de todos (con un ciclo).",
                        starter: L("function sumar(lista) {", "  // recorre la lista y devuelve el total", "}", ""),
                        hints: ["Empieza con let total = 0; dentro de la función.", "Recorre la lista con for (const n of lista) y suma.", "function sumar(lista) {\n  let total = 0;\n  for (const n of lista) {\n    total = total + n;\n  }\n  return total;\n}"],
                        check: { requires: [{ re: /\bfor\b/, msg: "Usa un ciclo for para recorrer la lista." }, { re: /\breturn\b/, msg: "Devuelve el total con return." }], cases: [{ append: "console.log(sumar([3, 5, 2]));", stdout: "10" }, { append: "console.log(sumar([1, 1, 1, 1]));", stdout: "4" }, { append: "console.log(sumar([10]));", stdout: "10" }, { append: "console.log(sumar([]));", stdout: "0" }] }
                    },
                    {
                        type: "exercise", id: "e2", title: "Regar varias plantas", concept: "Función + ciclo", xp: 15, visual: "loop",
                        goal: "Escribe <code>regarTodas(cantidad)</code>: muestra <b>Regando la planta 1</b>, <b>Regando la planta 2</b>… hasta la cantidad indicada.",
                        starter: L("function regarTodas(cantidad) {", "  // usa un ciclo for", "}", ""),
                        hints: ["Dentro de la función necesitas un for.", "for (let n = 1; n <= cantidad; n++)", "function regarTodas(cantidad) {\n  for (let n = 1; n <= cantidad; n++) {\n    console.log(\"Regando la planta \" + n);\n  }\n}"],
                        check: { requires: [{ re: /\bfor\b/, msg: "Usa un ciclo for dentro de la función." }], cases: [{ append: "regarTodas(3);", stdout: "Regando la planta 1\nRegando la planta 2\nRegando la planta 3" }, { append: "regarTodas(1);", stdout: "Regando la planta 1" }, { append: "regarTodas(5);", stdout: "Regando la planta 1\nRegando la planta 2\nRegando la planta 3\nRegando la planta 4\nRegando la planta 5" }] }
                    },
                    {
                        type: "exercise", id: "e3", title: "¿El cultivo está listo?", concept: "Función + condición", xp: 15, visual: "speech",
                        goal: "Escribe <code>estaListo(dias, diasNecesarios)</code>: <b>devuelve</b> <code>true</code> si ya pasaron los días necesarios (o más) y <code>false</code> si no.",
                        starter: L("function estaListo(dias, diasNecesarios) {", "  // devuelve true o false", "}", ""),
                        hints: ["Compara dias con diasNecesarios.", "Puedes usar un if con return true y return false.", "function estaListo(dias, diasNecesarios) {\n  return dias >= diasNecesarios;\n}"],
                        check: { requires: [{ re: /\breturn\b/, msg: "Usa return para devolver true o false." }], cases: [{ append: "console.log(estaListo(5, 5));", stdout: "true" }, { append: "console.log(estaListo(2, 5));", stdout: "false" }, { append: "console.log(estaListo(9, 3));", stdout: "true" }, { append: "console.log(estaListo(0, 1));", stdout: "false" }] }
                    },
                    {
                        type: "exercise", id: "e4", title: "Calcula las cosechas", concept: "Operaciones en una función", xp: 15, visual: "function",
                        goal: "Cada planta da <b>1 fruto</b> y cada planta <b>regada</b> da <b>1 fruto extra</b>. Escribe <code>cosechaTotal(plantas, regadas)</code> que devuelva el total de frutos.",
                        starter: L("function cosechaTotal(plantas, regadas) {", "  ", "}", ""),
                        hints: ["Cada planta da 1: ya tienes «plantas» frutos.", "Los extras son tantos como plantas regadas.", "function cosechaTotal(plantas, regadas) {\n  return plantas + regadas;\n}"],
                        check: { requires: [{ re: /\breturn\b/, msg: "Usa return para devolver el total." }], cases: [{ append: "console.log(cosechaTotal(5, 2));", stdout: "7" }, { append: "console.log(cosechaTotal(3, 3));", stdout: "6" }, { append: "console.log(cosechaTotal(4, 0));", stdout: "4" }, { append: "console.log(cosechaTotal(0, 0));", stdout: "0" }] }
                    },
                    {
                        type: "exercise", id: "e5", title: "Automatiza la semana", concept: "Ciclo + condición", xp: 20, visual: "loop",
                        goal: "Para cada día del 1 al 5 muestra <b>Día 1: riego</b> si el día es impar o <b>Día 2: descanso</b> si es par. Pista: un número es par si <code>dia % 2 === 0</code>.",
                        starter: "// Automatiza la semana de trabajo\n",
                        hints: ["Necesitas un for de 1 a 5 y, dentro, un if/else.", "if (dia % 2 === 0) { descanso } else { riego }", "for (let dia = 1; dia <= 5; dia++) {\n  if (dia % 2 === 0) {\n    console.log(\"Día \" + dia + \": descanso\");\n  } else {\n    console.log(\"Día \" + dia + \": riego\");\n  }\n}"],
                        check: { stdout: "Día 1: riego\nDía 2: descanso\nDía 3: riego\nDía 4: descanso\nDía 5: riego", requires: [{ re: /\bfor\b/, msg: "Usa un ciclo for." }, { re: /\bif\b/, msg: "Usa un if para decidir entre riego y descanso." }] }
                    }
                ]
            }
        ]
    };

    FC.registerCourse(HTML); FC.registerCourse(CSS); FC.registerCourse(JS);
})();
