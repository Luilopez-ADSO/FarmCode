/* ==========================================================
   data.js — Datos configurables del juego.
   Si quieres añadir un cultivo, una mascota o una opción de
   personaje, solo tienes que añadirla aquí.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});

    /* ---------- NIVELES ----------
       XP total necesaria para llegar al nivel L: 25 * L * (L - 1)
       (nivel 2 = 50 XP, nivel 3 = 150, nivel 4 = 300, ...) */
    FC.MAX_LEVEL = 12;
    FC.xpForLevel = L => 25 * L * (L - 1);
    FC.levelFromXp = xp => { let L = 1; while (L < FC.MAX_LEVEL && xp >= FC.xpForLevel(L + 1)) L++; return L; };

    /* ---------- CULTIVOS ----------
       growSec: segundos reales que tarda en crecer (se cuentan aunque cierres el juego)
       waterBoost: cuánto se acorta el tiempo restante al regar (0.4 = 40 %) */
    FC.CROPS = {
        carrot:  { id: "carrot",  name: "Zanahoria", plural: "zanahorias", growSec: 30,  waterBoost: 0.4, buy: 5,  sell: 9,  xp: 6,  minLevel: 1, icon: "carrot" },
        tomato:  { id: "tomato",  name: "Tomate",    plural: "tomates",    growSec: 60,  waterBoost: 0.4, buy: 12, sell: 22, xp: 12, minLevel: 2, icon: "tomato" },
        pumpkin: { id: "pumpkin", name: "Calabaza",  plural: "calabazas",  growSec: 100, waterBoost: 0.4, buy: 25, sell: 48, xp: 22, minLevel: 3, icon: "pumpkin" }
    };
    FC.CROP_ORDER = ["carrot", "tomato", "pumpkin"];

    /* ---------- MASCOTAS ---------- */
    FC.PETS = {
        dog:    { id: "dog",    name: "Code",  kind: "El perrito", desc: "Te acompaña desde el primer día y nunca se separa de ti.", unlock: { type: "start" }, hint: "Compañero inicial" },
        cat:    { id: "cat",    name: "Pixel", kind: "El gato",    desc: "Curioso y elegante. Le encanta mirar cómo crecen las plantas.", unlock: { type: "level", value: 3 }, hint: "Llega al nivel 3" },
        rabbit: { id: "rabbit", name: "Loop",  kind: "El conejo",  desc: "Salta en círculos, como un ciclo. Adora las zanahorias.", unlock: { type: "lesson", value: "l6" }, hint: "Completa la lección «Ciclos»" }
    };
    FC.PET_ORDER = ["dog", "cat", "rabbit"];

    /* ---------- OPCIONES DEL PERSONAJE ----------
       minLevel > 1 significa que se desbloquea al subir de nivel. */
    FC.AVATAR_OPTIONS = {
        skin: [
            { v: "#f8d9b9", n: "Clara" }, { v: "#f2c29b", n: "Beige" }, { v: "#d9a073", n: "Trigueña" },
            { v: "#b87a4b", n: "Canela" }, { v: "#8a5a36", n: "Morena" }, { v: "#5e3a22", n: "Oscura" }
        ],
        hairStyle: [
            { v: "corto", n: "Corto" }, { v: "largo", n: "Largo" }, { v: "rizado", n: "Rizado" },
            { v: "coleta", n: "Coleta" }, { v: "ninguno", n: "Sin pelo" }
        ],
        hairColor: [
            { v: "#2b1d14", n: "Negro" }, { v: "#5a3a20", n: "Castaño" }, { v: "#a0642d", n: "Cobrizo" },
            { v: "#e0b24a", n: "Rubio" }, { v: "#c9452a", n: "Pelirrojo" }, { v: "#8e8e96", n: "Gris" },
            { v: "#4a6fd0", n: "Azul", minLevel: 4 }, { v: "#8e5bb5", n: "Morado", minLevel: 5 }
        ],
        shirt: [
            { v: "#4e8b4a", n: "Verde granja" }, { v: "#3978b8", n: "Azul" }, { v: "#c94e45", n: "Rojo" },
            { v: "#d8a72f", n: "Amarillo" }, { v: "#8b62b3", n: "Morado" }, { v: "#e8e1d0", n: "Crema" },
            { v: "#e07aa1", n: "Rosa", minLevel: 2 }, { v: "#2f3a4a", n: "Noche", minLevel: 3 }
        ],
        pants: [
            { v: "#3f5aa0", n: "Vaquero" }, { v: "#6b4a2e", n: "Marrón" }, { v: "#3a3a42", n: "Gris oscuro" },
            { v: "#5a7a3a", n: "Oliva" }, { v: "#a0522d", n: "Ladrillo", minLevel: 2 }
        ],
        hat: [
            { v: "paja", n: "Sombrero de paja" }, { v: "ninguno", n: "Sin sombrero" },
            { v: "gorra", n: "Gorra azul", minLevel: 2 }, { v: "gorro", n: "Gorro morado", minLevel: 4 }
        ],
        accessory: [
            { v: "ninguno", n: "Ninguno" }, { v: "gafas", n: "Gafas", minLevel: 2 },
            { v: "bufanda", n: "Bufanda roja", minLevel: 3 }, { v: "panuelo", n: "Pañuelo", minLevel: 5 }
        ]
    };

    /* ---------- NOMBRES DE OBJETOS ---------- */
    FC.TOOLS = {
        hoe: { name: "Azada", icon: "hero", desc: "Prepara la tierra de las parcelas." },
        can: { name: "Regadera", icon: "drop", desc: "Riega las plantas para que crezcan más rápido." }
    };
    FC.SPECIALS = {
        python_badge: { name: "Insignia de Python", icon: "snake", desc: "La ganas al terminar el Huerto de Python." },
        golden_seed:  { name: "Semilla dorada", icon: "seed", desc: "Una semilla muy rara. ¡Guárdala!" },
        web_badge:    { name: "Insignia de programador web", icon: "code", desc: "La ganas al terminar el Campo de Máquinas." }
    };
})();
