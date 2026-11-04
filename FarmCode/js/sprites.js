/* ==========================================================
   sprites.js — Todo el pixel art de Farm Code, dibujado por código.
   No usa imágenes externas: nada puede "desaparecer".
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const TILE = 16;
    FC.TILE = TILE;
    const OUT = "#2b1d14"; // color del contorno

    function mk(w, h) {
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const x = c.getContext("2d");
        x.imageSmoothingEnabled = false;
        return [c, x];
    }
    function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
    function px(x, col, a, b, w, h) { x.fillStyle = col; x.fillRect(a, b, w === undefined ? 1 : w, h === undefined ? 1 : h); }
    function blob(x, cx, cy, rx, ry, col) {
        x.fillStyle = col;
        for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++)
            for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++) {
                const dx = (i + 0.5 - cx) / rx, dy = (j + 0.5 - cy) / ry;
                if (dx * dx + dy * dy <= 1) x.fillRect(i, j, 1, 1);
            }
    }
    function shade(hex, amt) {
        const n = parseInt(hex.slice(1), 16);
        let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
        const f = v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
        r = f(r); g = f(g); b = f(b);
        return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    }
    // Contorno oscuro alrededor de todo lo dibujado (da el look pixel art clásico).
    function outline(c, x, color) {
        const w = c.width, h = c.height;
        const src = x.getImageData(0, 0, w, h), d = src.data;
        const out = x.createImageData(w, h); out.data.set(d);
        const oc = parseInt(color.slice(1), 16);
        const R = oc >> 16, G = (oc >> 8) & 255, B = oc & 255;
        const a = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? 0 : d[(j * w + i) * 4 + 3];
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
            if (a(i, j) > 20) continue;
            if (a(i - 1, j) > 20 || a(i + 1, j) > 20 || a(i, j - 1) > 20 || a(i, j + 1) > 20) {
                const o = (j * w + i) * 4; out.data[o] = R; out.data[o + 1] = G; out.data[o + 2] = B; out.data[o + 3] = 255;
            }
        }
        x.putImageData(out, 0, 0);
        return c;
    }

    const S = FC.Sprites = { tile: {}, obj: {}, crop: {}, _icons: {}, _chars: {}, _pets: {} };

    /* ---------------- TERRENO ---------------- */
    function grassTile(v) {
        const [c, x] = mk(16, 16); const r = rng(100 + v * 31);
        px(x, "#79c24f", 0, 0, 16, 16);
        for (let i = 0; i < 10; i++) px(x, "#6ab244", (r() * 16) | 0, (r() * 16) | 0, 1, 1);
        for (let i = 0; i < 6; i++) px(x, "#8ad25e", (r() * 16) | 0, (r() * 16) | 0, 1, 1);
        for (let i = 0; i < 2 + v; i++) { const a = ((r() * 13) | 0) + 1, b = ((r() * 12) | 0) + 2; px(x, "#58a63b", a, b, 1, 2); px(x, "#58a63b", a + 1, b + 1, 1, 1); }
        return c;
    }
    function pathTile(v) {
        const [c, x] = mk(16, 16); const r = rng(500 + v * 17);
        px(x, "#d9b77c", 0, 0, 16, 16);
        for (let i = 0; i < 12; i++) px(x, "#c9a269", (r() * 16) | 0, (r() * 16) | 0, 1, 1);
        for (let i = 0; i < 7; i++) px(x, "#e8cb95", (r() * 16) | 0, (r() * 16) | 0, 1, 1);
        for (let i = 0; i < 2; i++) { const a = (r() * 13) | 0, b = (r() * 13) | 0; px(x, "#b99560", a, b, 2, 1); }
        return c;
    }
    function soilTile() {
        const [c, x] = mk(16, 16);
        px(x, "#8b5a34", 0, 0, 16, 16);
        for (let j = 2; j < 16; j += 5) { px(x, "#6d4326", 1, j, 14, 1); px(x, "#a06c3f", 1, j + 1, 14, 1); }
        px(x, "#6d4326", 0, 0, 16, 1); px(x, "#6d4326", 0, 15, 16, 1); px(x, "#6d4326", 0, 0, 1, 16); px(x, "#6d4326", 15, 0, 1, 16);
        return c;
    }
    function sandTile() {
        const [c, x] = mk(16, 16); const r = rng(900);
        px(x, "#ecd9a0", 0, 0, 16, 16);
        for (let i = 0; i < 9; i++) px(x, "#dcc686", (r() * 16) | 0, (r() * 16) | 0, 1, 1);
        for (let i = 0; i < 5; i++) px(x, "#f6e9bd", (r() * 16) | 0, (r() * 16) | 0, 1, 1);
        return c;
    }
    function waterTile(f) {
        const [c, x] = mk(16, 16); const r = rng(77);
        px(x, "#3f8fd6", 0, 0, 16, 16);
        for (let i = 0; i < 5; i++) { const a = (((r() * 12) | 0) + f * 3) % 14, b = (r() * 14) | 0; px(x, "#7cc0f0", a, b, 3, 1); px(x, "#2f78bd", (a + 5) % 14, (b + 4) % 15, 2, 1); }
        return c;
    }
    S.tile.grass = [0, 1, 2, 3].map(grassTile);
    S.tile.path = [0, 1, 2].map(pathTile);
    S.tile.soil = soilTile();
    S.tile.sand = sandTile();
    S.tile.water = [waterTile(0), waterTile(1)];

    /* ---------------- ÁRBOLES, ARBUSTOS Y DECORADO ---------------- */
    function tree(seed, kind) {
        const [c, x] = mk(38, 46); const r = rng(seed);
        blob(x, 19, 42, 12, 3, "rgba(0,0,0,.2)");
        if (kind === "pine") {
            px(x, "#7a5230", 16, 32, 6, 10); px(x, "#5c3b22", 20, 32, 2, 10);
            const cols = ["#2d7a45", "#34914f", "#3fa85a"];
            for (let i = 0; i < 4; i++) {
                const top = 4 + i * 8, half = 5 + i * 3;
                for (let j = 0; j < 11; j++) {
                    const w = Math.round(half * (j + 1) / 11);
                    px(x, cols[i % 3 === 0 ? 0 : 1], 19 - w, top + j, w * 2, 1);
                    px(x, cols[2], 19 - w, top + j, Math.max(1, (w * 0.7) | 0), 1);
                }
            }
        } else {
            px(x, "#7a5230", 16, 28, 6, 14); px(x, "#5c3b22", 20, 28, 2, 14); px(x, "#946840", 16, 28, 1, 14);
            blob(x, 19, 20, 15, 14, "#2f7a3a");
            blob(x, 10, 24, 8, 7, "#2f7a3a"); blob(x, 28, 24, 8, 7, "#2f7a3a");
            blob(x, 18, 18, 13, 12, "#3e9a45");
            blob(x, 12, 14, 7, 6, "#5cb85a");
            blob(x, 23, 11, 4, 3, "#6cc767");
            for (let i = 0; i < 16; i++) px(x, "#2f7a3a", 6 + ((r() * 26) | 0), 12 + ((r() * 18) | 0), 2, 1);
            px(x, "#8ede7c", 11, 9, 2, 1); px(x, "#8ede7c", 21, 7, 2, 1);
        }
        return outline(c, x, OUT);
    }
    S.obj.tree = [tree(1, "round"), tree(2, "round"), tree(3, "pine"), tree(4, "pine")];

    function bush(berries) {
        const [c, x] = mk(20, 16);
        blob(x, 10, 13, 8, 2, "rgba(0,0,0,.18)");
        blob(x, 10, 9, 8, 6, "#2f7a3a"); blob(x, 7, 8, 5, 4, "#3e9a45"); blob(x, 13, 9, 4, 4, "#3e9a45"); blob(x, 7, 6, 2, 2, "#5cb85a");
        if (berries) { [[6, 9], [11, 7], [13, 11], [9, 11]].forEach(p => px(x, "#d9453a", p[0], p[1], 2, 2)); }
        return outline(c, x, OUT);
    }
    S.obj.bush = [bush(false), bush(true)];

    function rock() {
        const [c, x] = mk(18, 14);
        blob(x, 9, 11, 7, 2, "rgba(0,0,0,.18)");
        blob(x, 9, 8, 7, 5, "#8d949b"); blob(x, 7, 6, 4, 3, "#aab1b8"); blob(x, 12, 9, 3, 2, "#6f757c");
        return outline(c, x, OUT);
    }
    S.obj.rock = rock();

    function flower(col, seed) {
        const [c, x] = mk(16, 16); const r = rng(seed);
        for (let i = 0; i < 3; i++) {
            const a = 3 + ((r() * 9) | 0), b = 4 + ((r() * 8) | 0);
            px(x, "#3e9a45", a, b + 1, 1, 3);
            px(x, col, a - 1, b, 3, 1); px(x, col, a, b - 1, 1, 3); px(x, "#fff3b0", a, b, 1, 1);
        }
        return c;
    }
    S.obj.flowers = ["#f28ab2", "#fff7e0", "#f5d04c", "#8e9bf0", "#ff9a4d"].map((c, i) => flower(c, 40 + i));

    function fence(kind) {
        const [c, x] = mk(18, 18);
        const wood = "#b98a52", dark = "#8a6238", hi = "#d3a870";
        if (kind === "h") {
            px(x, wood, 1, 6, 16, 3); px(x, hi, 1, 6, 16, 1); px(x, dark, 1, 8, 16, 1);
            px(x, wood, 1, 11, 16, 3); px(x, hi, 1, 11, 16, 1); px(x, dark, 1, 13, 16, 1);
            px(x, wood, 2, 3, 4, 13); px(x, hi, 2, 3, 4, 1); px(x, dark, 5, 4, 1, 12);
        } else {
            px(x, dark, 7, 3, 4, 16); px(x, wood, 7, 3, 3, 16); px(x, hi, 7, 3, 3, 1);
            px(x, wood, 8, 9, 2, 8);
        }
        return outline(c, x, OUT);
    }
    S.obj.fenceH = fence("h"); S.obj.fenceV = fence("v");

    function gate(open) {
        const [c, x] = mk(34, 22);
        const wood = "#b98a52", dark = "#8a6238", hi = "#d3a870";
        px(x, dark, 2, 3, 4, 17); px(x, wood, 2, 3, 3, 17); px(x, dark, 28, 3, 4, 17); px(x, wood, 28, 3, 3, 17);
        px(x, hi, 2, 3, 3, 1); px(x, hi, 28, 3, 3, 1);
        if (!open) {
            px(x, wood, 6, 6, 22, 3); px(x, wood, 6, 12, 22, 3); px(x, hi, 6, 6, 22, 1);
            for (let i = 0; i < 4; i++) px(x, wood, 8 + i * 6, 6, 3, 14);
            px(x, "#f2b134", 15, 10, 4, 4); px(x, "#2b1d14", 16, 11, 2, 2);
        } else {
            px(x, wood, 6, 8, 3, 12); px(x, wood, 25, 8, 3, 12);
        }
        return outline(c, x, OUT);
    }
    S.obj.gateClosed = gate(false); S.obj.gateOpen = gate(true);

    function house() {
        const [c, x] = mk(84, 74);
        blob(x, 42, 70, 36, 3, "rgba(0,0,0,.2)");
        // paredes
        px(x, "#f1dcae", 6, 30, 72, 38); px(x, "#dcc38b", 6, 30, 72, 2);
        for (let j = 36; j < 68; j += 6) px(x, "#d9bf86", 6, j, 72, 1);
        px(x, "#c9ad73", 6, 66, 72, 2);
        // techo
        for (let j = 0; j < 28; j++) {
            const inset = Math.round(j * 0.35);
            px(x, j % 4 < 2 ? "#b5493a" : "#a13f32", 2 + inset, 4 + j, 80 - inset * 2, 1);
        }
        for (let j = 0; j < 28; j += 4) px(x, "#d46a56", 4 + Math.round(j * 0.35), 4 + j, 76 - Math.round(j * .7), 1);
        px(x, "#7e2f26", 2, 30, 80, 3);
        // chimenea
        px(x, "#8d6e63", 60, 0, 9, 14); px(x, "#6f544b", 66, 0, 3, 14); px(x, "#a6877c", 60, 0, 9, 2);
        // puerta
        px(x, "#5c3b22", 33, 44, 18, 24); px(x, "#7a5230", 35, 46, 14, 22); px(x, "#946840", 35, 46, 14, 1);
        px(x, "#f2b134", 46, 58, 2, 2); px(x, "#5c3b22", 41, 46, 1, 22);
        px(x, "#c9ad73", 30, 68, 24, 3);
        // ventanas
        [[12, 40], [58, 40]].forEach(p => {
            px(x, "#7a5230", p[0] - 1, p[1] - 1, 16, 14); px(x, "#9fd8ee", p[0], p[1], 14, 12);
            px(x, "#c9eefa", p[0] + 1, p[1] + 1, 5, 4); px(x, "#7a5230", p[0] + 6, p[1], 2, 12); px(x, "#7a5230", p[0], p[1] + 5, 14, 2);
            px(x, "#8a6238", p[0] - 2, p[1] + 12, 18, 3);
            px(x, "#3e9a45", p[0] + 1, p[1] + 11, 12, 2); [2, 6, 10].forEach(o => px(x, ["#f28ab2", "#f5d04c", "#fff7e0"][o / 4 | 0], p[0] + o, p[1] + 10, 2, 2));
        });
        return outline(c, x, OUT);
    }
    S.obj.house = house();

    function stall() {
        const [c, x] = mk(44, 44);
        blob(x, 22, 41, 18, 3, "rgba(0,0,0,.2)");
        px(x, "#8a6238", 4, 14, 3, 26); px(x, "#8a6238", 37, 14, 3, 26);
        px(x, "#b98a52", 6, 28, 32, 12); px(x, "#d3a870", 6, 28, 32, 2); px(x, "#8a6238", 6, 38, 32, 2);
        for (let i = 0; i < 8; i++) px(x, i % 2 ? "#fff7e0" : "#d9453a", 2 + i * 5, 4, 5, 12);
        for (let i = 0; i < 8; i++) px(x, i % 2 ? "#e8dcc0" : "#b83a30", 2 + i * 5, 16, 5, 3);
        // frutas en el mostrador
        blob(x, 12, 26, 3, 3, "#f08a24"); blob(x, 19, 26, 3, 3, "#d9453a"); blob(x, 26, 26, 3, 3, "#f08a24"); blob(x, 33, 26, 3, 3, "#d9453a");
        px(x, "#3e9a45", 11, 22, 2, 2); px(x, "#3e9a45", 18, 22, 2, 2);
        return outline(c, x, OUT);
    }
    S.obj.stall = stall();

    function signPost() {
        const [c, x] = mk(30, 30);
        blob(x, 15, 27, 8, 2, "rgba(0,0,0,.2)");
        px(x, "#7a5230", 13, 14, 4, 14); px(x, "#5c3b22", 15, 14, 2, 14);
        px(x, "#b98a52", 3, 3, 24, 14); px(x, "#d3a870", 3, 3, 24, 2); px(x, "#8a6238", 3, 15, 24, 2);
        // mini serpiente de Python
        blob(x, 11, 10, 3, 3, "#3d7ab8"); blob(x, 17, 10, 3, 3, "#f5d04c"); px(x, "#fff", 9, 9, 1, 1); px(x, "#fff", 19, 11, 1, 1);
        px(x, "#2b4a6b", 13, 8, 4, 1); px(x, "#a98414", 13, 12, 4, 1);
        return outline(c, x, OUT);
    }
    S.obj.sign = signPost();

    function board() {
        const [c, x] = mk(36, 34);
        blob(x, 18, 31, 12, 2, "rgba(0,0,0,.2)");
        px(x, "#7a5230", 5, 12, 4, 19); px(x, "#7a5230", 27, 12, 4, 19);
        px(x, "#8a6238", 2, 2, 32, 22); px(x, "#c99a62", 4, 4, 28, 18); px(x, "#d3a870", 4, 4, 28, 1);
        px(x, "#fff7e0", 7, 7, 7, 9); px(x, "#f5d04c", 16, 6, 7, 8); px(x, "#e8f1dd", 24, 9, 6, 9);
        px(x, "#d9453a", 10, 6, 1, 1); px(x, "#3d7ab8", 19, 5, 1, 1);
        for (let i = 0; i < 3; i++) { px(x, "#8a8a8a", 8, 9 + i * 2, 5, 1); px(x, "#8a8a8a", 17, 8 + i * 2, 5, 1); px(x, "#8a8a8a", 25, 11 + i * 2, 4, 1); }
        return outline(c, x, OUT);
    }
    S.obj.board = board();

    function well() {
        const [c, x] = mk(28, 34);
        blob(x, 14, 31, 11, 2, "rgba(0,0,0,.2)");
        px(x, "#7a5230", 4, 6, 3, 16); px(x, "#7a5230", 21, 6, 3, 16);
        for (let i = 0; i < 12; i++) px(x, "#a85a48", 2 + Math.round(i * .25), 2 + i * 0, 24 - Math.round(i * .5), 1);
        px(x, "#b5493a", 2, 2, 24, 4); px(x, "#7e2f26", 2, 5, 24, 1);
        blob(x, 14, 23, 11, 6, "#8d949b"); blob(x, 14, 21, 9, 4, "#3f8fd6"); blob(x, 12, 20, 3, 1.2, "#7cc0f0");
        px(x, "#aab1b8", 3, 25, 22, 1);
        px(x, "#c9a269", 13, 6, 2, 10);
        return outline(c, x, OUT);
    }
    S.obj.well = well();

    /* ---------------- CULTIVOS (4 etapas) ---------------- */
    function cropSprite(type, stage) {
        const [c, x] = mk(16, 16);
        const leaf = "#3e9a45", leafL = "#6cc767", leafD = "#2d7a45";
        if (stage === 0) { px(x, "#5e3c20", 6, 10, 4, 2); px(x, "#a06c3f", 7, 9, 2, 1); px(x, "#c9a269", 7, 10, 1, 1); return c; }
        if (stage === 1) {
            px(x, leaf, 7, 8, 2, 4); px(x, leafL, 5, 7, 3, 2); px(x, leafL, 8, 6, 3, 2); px(x, leafD, 7, 11, 2, 1);
            return c;
        }
        if (type === "carrot") {
            if (stage === 2) { px(x, leaf, 6, 5, 1, 7); px(x, leaf, 8, 3, 1, 9); px(x, leaf, 10, 5, 1, 7); px(x, leafL, 5, 4, 2, 3); px(x, leafL, 8, 2, 2, 3); px(x, leafL, 10, 4, 2, 3); }
            else { px(x, leaf, 5, 3, 1, 6); px(x, leaf, 8, 1, 1, 8); px(x, leaf, 11, 3, 1, 6); px(x, leafL, 4, 2, 2, 3); px(x, leafL, 8, 0, 2, 3); px(x, leafL, 11, 2, 2, 3); px(x, "#f08a24", 6, 9, 4, 3); px(x, "#ffb04d", 6, 9, 1, 2); px(x, "#c96c14", 9, 10, 1, 2); px(x, "#f08a24", 5, 11, 2, 1); px(x, "#f08a24", 10, 11, 1, 1); }
        } else if (type === "tomato") {
            px(x, "#8a6238", 8, 2, 1, 12);
            px(x, leaf, 5, 4, 3, 2); px(x, leaf, 9, 6, 3, 2); px(x, leaf, 5, 9, 3, 2); px(x, leafL, 6, 4, 1, 1);
            if (stage === 3) { blob(x, 6, 7, 2, 2, "#d9453a"); blob(x, 11, 10, 2, 2, "#d9453a"); blob(x, 6, 12, 2, 2, "#e8574c"); px(x, leafD, 5, 5, 2, 1); px(x, "#fff", 5, 6, 1, 1); }
            else { blob(x, 6, 8, 1.2, 1.2, "#8bd450"); blob(x, 11, 10, 1.2, 1.2, "#8bd450"); }
        } else {
            px(x, leaf, 2, 6, 5, 3); px(x, leaf, 10, 5, 4, 3); px(x, leafL, 3, 6, 2, 1); px(x, leafL, 11, 5, 2, 1); px(x, leafD, 7, 8, 2, 2);
            if (stage === 3) { blob(x, 8, 10, 5, 4, "#f08a24"); blob(x, 6, 10, 2, 4, "#d9731a"); blob(x, 11, 10, 2, 4, "#d9731a"); px(x, "#ffb04d", 7, 8, 2, 1); px(x, "#4a7a2a", 7, 5, 2, 2); }
            else blob(x, 8, 10, 2.5, 2, "#8bd450");
        }
        return c;
    }
    ["carrot", "tomato", "pumpkin"].forEach(t => { S.crop[t] = [0, 1, 2, 3].map(s => outlineLight(cropSprite(t, s))); });
    function outlineLight(c) { return c; } // los cultivos no llevan contorno (se ven sobre la tierra)

    /* ---------------- ICONOS 8x8 ---------------- */
    const PAL = {
        k: "#2b1d14", b: "#8a5a33", B: "#5a3a20", w: "#fff7e0", g: "#4caf50", G: "#2e7d32", l: "#8bd450",
        r: "#d9453a", R: "#9e2a2b", o: "#f08a24", O: "#c96c14", y: "#f5d04c", Y: "#c9a227", c: "#5ab0e8", C: "#2f6fb5",
        p: "#8e5bb5", s: "#f2c29b", n: "#9aa0a6", N: "#6f757c", t: "#d9b57a", m: "#f28ab2", d: "#3d7ab8"
    };
    const ICONS = {
        seed: ["........", "...kk...", "..kbbk..", ".kbwbbk.", ".kbbbbk.", "..kbbk..", "...kk...", "........"],
        drop: ["...cc...", "...cc...", "..cwcc..", ".cwcccc.", ".ccccCc.", ".cccCCc.", "..cCCc..", "...cc..."],
        carrot: ["..g.gg..", "..gGg...", "...oo...", "..owoO..", "..oooO..", "...oO...", "...oO...", "....O..."],
        tomato: ["...gg...", ".rrGgrr.", "rrrrrrrR", "rwrrrrrR", "rrrrrrRR", "rrrrrRRR", ".rrrRRR.", "..RRRR.."],
        pumpkin: ["....gg..", "..ooGoo.", ".ooOoOoo", "ooOoOoOo", "owOoOoOo", "ooOoOoOo", ".ooOoOo.", "..OOOO.."],
        coin: ["..kkkk..", ".kyyyyk.", "kywyyYyk", "kyyyyYyk", "kyyyyYyk", "kyyyYYyk", ".kyYYyk.", "..kkkk.."],
        star: ["...yy...", "...yy...", "yyyyyyyy", ".yyyyyy.", "..yyyy..", ".yyyyyy.", ".yy..yy.", "yy....yy"],
        heart: [".rr..rr.", "rrrrrrrr", "rwrrrrrr", "rrrrrrrr", ".rrrrrr.", "..rrrr..", "...rr...", "........"],
        paw: [".bb..bb.", ".bb..bb.", "b..bb..b", "b.bbbb.b", "..bbbb..", "..bbbb..", "..b..b..", "........"],
        scroll: [".kkkkkk.", "kttttttk", ".twwwwt.", ".twkkwt.", ".twwwwt.", ".twkkwt.", "kttttttk", ".kkkkkk."],
        book: [".kkkkkk.", "kggggggk", "kgwwwwgk", "kgwggggk", "kgwwwwgk", "kggggwgk", "kGGGGGGk", ".kkkkkk."],
        bag: ["...kk...", "..kbbk..", ".kbbbbk.", "kbbwwbbk", "kbbbbbbk", "kbbyybbk", "kbbbbbbk", ".kkkkkk."],
        trophy: ["yyyyyyyy", "y.yyyy.y", "y.ywyy.y", ".yyyyyy.", "..yyyy..", "...yy...", "..yyyy..", ".yyyyyy."],
        people: ["........", ".ss..ss.", ".ss..ss.", "ggggdddd", "ggggdddd", "ggggdddd", ".gg..dd.", "........"],
        help: ["..yyyy..", ".yy..yy.", ".....yy.", "...yyy..", "..yy....", "........", "..yy....", "........"],
        door: [".kkkkk..", ".kbbbbk.", ".kbbbbk.", ".kbbybk.", ".kbbbbk.", ".kbbbbk.", ".kbbbbk.", ".kkkkkk."],
        farm: ["...rr...", "..rrrr..", ".rrrrrr.", "rrrrrrrr", ".tttttt.", ".twttwt.", ".ttkktt.", ".ttkktt."],
        hero: ["..yyyy..", ".yyyyyy.", "..ssss..", "..sksk..", "..ssss..", ".gggggg.", ".gggggg.", "..b..b.."],
        lock: ["..kkkk..", ".k....k.", ".k....k.", "kkkkkkkk", "kyyyyyyk", "kyykkyyk", "kyyyyyyk", "kkkkkkkk"],
        check: ["........", "......gg", ".....gg.", "g...gg..", "gg.gg...", ".ggg....", "..g.....", "........"],
        arrow: ["...k....", "...kk...", "kkkkkkk.", "kkkkkkkk", "kkkkkkk.", "...kk...", "...k....", "........"],
        snake: ["..dddd..", ".dwddwd.", ".dddddd.", "..dddy..", ".ddyy...", ".dyyyy..", "..yyyyy.", "........"],
        sound: ["...k....", "..kk..k.", "kkkk.k.k", "kkkk.k.k", "kkkk.k.k", "..kk..k.", "...k....", "........"],
        brick: ["rrrrwrrr", "wwwwwwww", "rwrrrrwr", "wwwwwwww", "rrrrwrrr", "wwwwwwww", "rwrrrrwr", "........"],
        brush: ["..kkkk..", ".kwwwwk.", "kwrwwywk", "kwwwwwwk", "kwcwwgwk", ".kwwwwk.", "..kkkkk.", "........"],
        gear: ["...nn...", ".n.nn.n.", "..nnnn..", "nnn..nnn", "nnn..nnn", "..nnnn..", ".n.nn.n.", "...nn..."],
        code: ["........", "..c..c..", ".c....c.", "c..yy..c", ".c.yy.c.", "..c..c..", "........", "........"],
        lamp: ["..yyyy..", ".yywwyy.", ".yywwyy.", "..yyyy..", "...kk...", "...kk...", "...kk...", "..kkkk.."],
        gift: ["..r..r..", ".rr..rr.", "yyyyyyyy", "yrrrrrry", "yyyyyyyy", "yrrrrrry", "yrrrrrry", "yyyyyyyy"]
    };
    S.icon = function (name) {
        if (S._icons[name]) return S._icons[name];
        let rows = ICONS[name];
        if (!rows) { // iconos de mascotas
            rows = ICONS.paw;
        }
        const [c, x] = mk(8, 8);
        rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== "." && PAL[ch]) px(x, PAL[ch], i, j, 1, 1); }));
        const url = c.toDataURL();
        S._icons[name] = url; S._iconCanv = S._iconCanv || {}; S._iconCanv[name] = c;
        return url;
    };
    // Devuelve el icono 8x8 como canvas (para dibujarlo dentro de otros sprites).
    S.iconCanvas = function (name) { S.icon(name); return S._iconCanv[name]; };
    S.iconHtml = (name, size) => `<img class="pxicon" alt="" src="${S.icon(name)}" style="width:${size || 24}px;height:${size || 24}px">`;

    /* ---------------- PERSONAJE ---------------- */
    const CW = 20, CH = 28, OX = 2, OY = 3;
    function drawChar(x, a, dir, frame, act) {
        const skin = a.skin, skinD = shade(a.skin, -0.14);
        const hair = a.hairColor, hairD = shade(hair, -0.25), hairL = shade(hair, 0.2);
        const shirt = a.shirt, shirtD = shade(shirt, -0.2), shirtL = shade(shirt, 0.15);
        const pants = a.pants, pantsD = shade(pants, -0.2);
        const shoe = "#4a2e1c";
        const bob = (frame === 1 || frame === 3) ? -1 : 0;
        const step = frame === 1 ? -1 : frame === 3 ? 1 : 0;
        const style = a.hairStyle, hat = a.hat, acc = a.accessory;
        x.save(); x.translate(OX, OY);

        if (dir === "down" || dir === "up") {
            const back = dir === "up";
            // piernas
            [[5, step === -1], [8, step === 1]].forEach(([lx, raised]) => {
                const yb = 23 - (raised ? 1 : 0);
                px(x, pants, lx, 18, 3, yb - 3 - 18); px(x, pantsD, lx + 2, 18, 1, yb - 3 - 18);
                px(x, shoe, lx, yb - 3, 3, 2);
            });
            // torso
            px(x, shirt, 4, 12 + bob, 8, 5); px(x, shirtD, 10, 12 + bob, 2, 5); px(x, shirtL, 4, 12 + bob, 8, 1);
            px(x, pants, 4, 17 + bob, 8, 1); px(x, "#f2b134", 7, 17 + bob, 2, 1);
            // brazos
            const la = step === -1 ? 1 : step === 1 ? -1 : 0;
            let ra = -la;
            if (act) ra = act === 1 ? -3 : 3;
            px(x, shirt, 2, 13 + bob + la, 2, 3); px(x, skin, 2, 16 + bob + la, 2, 1);
            px(x, shirt, 12, 13 + bob + ra, 2, 3); px(x, skin, 12, 16 + bob + ra, 2, 1);
            if (act) { // herramienta
                const ty = act === 1 ? 6 + bob : 17 + bob;
                px(x, "#8a6238", 13, ty, 1, 8); px(x, "#9aa0a6", 12, ty + (act === 1 ? -1 : 7), 4, 2);
            }
            // cabeza
            px(x, skin, 4, 4 + bob, 8, 7); px(x, skinD, 4, 10 + bob, 8, 1);
            if (!back) {
                px(x, "#2b1d14", 6, 8 + bob, 1, 2); px(x, "#2b1d14", 9, 8 + bob, 1, 2);
                px(x, "#ec9f8e", 5, 10 + bob, 1, 1); px(x, "#ec9f8e", 10, 10 + bob, 1, 1);
            }
            // pelo
            if (style !== "ninguno") {
                if (back) {
                    px(x, hair, 4, 3 + bob, 8, 8); px(x, hairD, 4, 9 + bob, 8, 2);
                    if (style === "largo") { px(x, hair, 3, 5 + bob, 10, 9); px(x, hairD, 4, 12 + bob, 8, 2); }
                    if (style === "rizado") { px(x, hair, 2, 2 + bob, 12, 9); }
                    if (style === "coleta") { px(x, hair, 7, 10 + bob, 3, 5); px(x, hairD, 8, 12 + bob, 1, 3); }
                } else {
                    if (style === "rizado") { px(x, hair, 2, 2 + bob, 12, 4); px(x, hair, 2, 5 + bob, 2, 4); px(x, hair, 12, 5 + bob, 2, 4); px(x, hairL, 4, 2 + bob, 3, 1); }
                    else {
                        px(x, hair, 4, 3 + bob, 8, 3); px(x, hair, 4, 5 + bob, 2, 3); px(x, hair, 10, 5 + bob, 2, 3); px(x, hairL, 5, 3 + bob, 3, 1);
                        px(x, hairD, 6, 5 + bob, 4, 1);
                        if (style === "largo") { px(x, hair, 3, 5 + bob, 2, 9); px(x, hair, 11, 5 + bob, 2, 9); px(x, hairD, 3, 12 + bob, 2, 2); px(x, hairD, 11, 12 + bob, 2, 2); }
                    }
                }
            }
            if (!back && acc === "gafas") { px(x, "#2b1d14", 5, 7 + bob, 3, 3); px(x, "#2b1d14", 8, 7 + bob, 3, 3); px(x, "#bfe6ff", 6, 8 + bob, 1, 1); px(x, "#bfe6ff", 9, 8 + bob, 1, 1); px(x, "#2b1d14", 8, 8 + bob, 1, 1); }
            if (acc === "bufanda") { px(x, "#d9453a", 4, 11 + bob, 8, 2); px(x, "#9e2a2b", 4, 12 + bob, 8, 1); if (!back) px(x, "#d9453a", 5, 13 + bob, 2, 3); }
            if (acc === "panuelo") { px(x, "#d9453a", 4, 4 + bob, 8, 2); px(x, "#9e2a2b", 4, 5 + bob, 8, 1); if (back) px(x, "#d9453a", 10, 5 + bob, 3, 2); }
            // sombreros
            if (hat === "paja") { px(x, "#e3b84a", 1, 3 + bob, 14, 2); px(x, "#f1cd6a", 1, 3 + bob, 14, 1); px(x, "#e3b84a", 4, 0 + bob, 8, 3); px(x, "#d9453a", 4, 2 + bob, 8, 1); px(x, "#c99a2a", 1, 4 + bob, 14, 1); }
            if (hat === "gorra") { px(x, "#3d7ab8", 4, 1 + bob, 8, 4); px(x, "#2f6fb5", 4, 4 + bob, 8, 1); px(x, "#5a9ad8", 5, 1 + bob, 3, 1); if (!back) px(x, "#2a5f99", 4, 5 + bob, 8, 1); else px(x, "#2a5f99", 6, 5 + bob, 4, 1); }
            if (hat === "gorro") { px(x, "#8e5bb5", 4, 1 + bob, 8, 4); px(x, "#a97dcf", 4, 1 + bob, 8, 1); px(x, "#6e3f94", 4, 4 + bob, 8, 1); px(x, "#fff7e0", 7, -1 + bob, 2, 2); px(x, "#6e3f94", 4, 3 + bob, 8, 1); }
            if (hat === "casco") { px(x, "#f5c518", 3, 1 + bob, 10, 4); px(x, "#fbe27a", 4, 1 + bob, 4, 1); px(x, "#c99a10", 3, 4 + bob, 10, 1); px(x, "#f5c518", 7, 0 + bob, 2, 1); }
            if (hat === "boina") { px(x, "#8e3b6e", 3, 1 + bob, 10, 3); px(x, "#a64e85", 4, 1 + bob, 5, 1); px(x, "#6e2a53", 3, 3 + bob, 10, 1); px(x, "#6e2a53", 7, 0 + bob, 2, 1); }
        } else {
            // vista lateral (izquierda)
            const f = frame;
            const frontLeg = f === 1 ? 2 : f === 3 ? -2 : 0;
            // pierna de atrás (más oscura) y pierna de delante
            px(x, pantsD, 7 - frontLeg, 18, 3, 3); px(x, shoe, 6 - frontLeg, 21, 4, 2);
            px(x, pants, 7 + frontLeg, 18, 3, 3); px(x, shoe, 6 + frontLeg, 21, 4, 2);
            // torso
            px(x, shirt, 5, 12 + bob, 6, 5); px(x, shirtD, 9, 12 + bob, 2, 5); px(x, shirtL, 5, 12 + bob, 6, 1);
            px(x, pants, 5, 17 + bob, 6, 1);
            // brazo
            const armX = act ? 2 : (f === 1 ? 4 : f === 3 ? 9 : 7);
            px(x, shirt, armX, 13 + bob, 2, 3); px(x, skin, armX, 16 + bob, 2, 1);
            if (act) { const tx = act === 1 ? 3 : 0; px(x, "#8a6238", tx, act === 1 ? 7 + bob : 15 + bob, 1, 7); px(x, "#9aa0a6", tx - 1 < 0 ? 0 : tx - 1, act === 1 ? 6 + bob : 21 + bob, 3, 2); }
            // cabeza
            px(x, skin, 4, 4 + bob, 8, 7); px(x, skinD, 4, 10 + bob, 8, 1); px(x, skin, 3, 8 + bob, 1, 2);
            px(x, "#2b1d14", 5, 8 + bob, 1, 2); px(x, "#ec9f8e", 6, 10 + bob, 1, 1);
            if (style !== "ninguno") {
                px(x, hair, 5, 3 + bob, 7, 3); px(x, hair, 8, 5 + bob, 4, 5); px(x, hairL, 6, 3 + bob, 3, 1); px(x, hairD, 10, 8 + bob, 2, 2);
                if (style === "largo") { px(x, hair, 8, 5 + bob, 5, 9); px(x, hairD, 10, 12 + bob, 3, 2); }
                if (style === "rizado") { px(x, hair, 4, 2 + bob, 9, 4); px(x, hair, 8, 5 + bob, 5, 5); }
                if (style === "coleta") { px(x, hair, 11, 6 + bob, 3, 2); px(x, hair, 12, 8 + bob, 2, 5); px(x, hairD, 13, 9 + bob, 1, 4); }
            }
            if (acc === "gafas") { px(x, "#2b1d14", 4, 7 + bob, 4, 3); px(x, "#bfe6ff", 5, 8 + bob, 2, 1); px(x, "#2b1d14", 8, 8 + bob, 3, 1); }
            if (acc === "bufanda") { px(x, "#d9453a", 5, 11 + bob, 7, 2); px(x, "#9e2a2b", 5, 12 + bob, 7, 1); px(x, "#d9453a", 10, 13 + bob, 2, 3); }
            if (acc === "panuelo") { px(x, "#d9453a", 4, 4 + bob, 8, 2); px(x, "#9e2a2b", 4, 5 + bob, 8, 1); px(x, "#d9453a", 11, 5 + bob, 3, 2); }
            if (hat === "paja") { px(x, "#e3b84a", 0, 3 + bob, 14, 2); px(x, "#f1cd6a", 0, 3 + bob, 14, 1); px(x, "#e3b84a", 4, 0 + bob, 8, 3); px(x, "#d9453a", 4, 2 + bob, 8, 1); px(x, "#c99a2a", 0, 4 + bob, 14, 1); }
            if (hat === "gorra") { px(x, "#3d7ab8", 4, 1 + bob, 8, 4); px(x, "#5a9ad8", 5, 1 + bob, 3, 1); px(x, "#2a5f99", 1, 4 + bob, 6, 1); px(x, "#2f6fb5", 4, 4 + bob, 8, 1); }
            if (hat === "gorro") { px(x, "#8e5bb5", 4, 1 + bob, 8, 4); px(x, "#a97dcf", 4, 1 + bob, 8, 1); px(x, "#6e3f94", 4, 4 + bob, 8, 1); px(x, "#fff7e0", 7, -1 + bob, 2, 2); }
            if (hat === "casco") { px(x, "#f5c518", 3, 1 + bob, 10, 4); px(x, "#fbe27a", 4, 1 + bob, 4, 1); px(x, "#c99a10", 2, 4 + bob, 11, 1); px(x, "#f5c518", 7, 0 + bob, 2, 1); }
            if (hat === "boina") { px(x, "#8e3b6e", 3, 1 + bob, 10, 3); px(x, "#a64e85", 4, 1 + bob, 5, 1); px(x, "#6e2a53", 3, 3 + bob, 10, 1); px(x, "#6e2a53", 7, 0 + bob, 2, 1); }
        }
        x.restore();
    }
    // Devuelve una hoja con 4 columnas (fotogramas) x 8 filas: 4 direcciones caminando + 4 direcciones usando herramienta.
    S.charSheet = function (a) {
        const key = JSON.stringify([a.skin, a.hairStyle, a.hairColor, a.shirt, a.pants, a.hat, a.accessory]);
        if (S._chars[key]) return S._chars[key];
        const [sheet, sx] = mk(CW * 4, CH * 8);
        const dirs = ["down", "left", "right", "up"];
        for (let row = 0; row < 8; row++) {
            const d = dirs[row % 4], isAct = row >= 4;
            for (let f = 0; f < 4; f++) {
                const [c, x] = mk(CW, CH);
                const actFrame = isAct ? (f === 0 ? 0 : f === 1 ? 1 : 2) : 0;
                const dd = d === "right" ? "left" : d;
                drawChar(x, a, dd, isAct ? 0 : f, isAct ? Math.max(1, actFrame) : 0);
                outline(c, x, OUT);
                if (d === "right") {
                    sx.save(); sx.translate(f * CW + CW, row * CH); sx.scale(-1, 1); sx.drawImage(c, 0, 0); sx.restore();
                } else sx.drawImage(c, f * CW, row * CH);
            }
        }
        S._chars[key] = sheet;
        return sheet;
    };
    S.CHAR = { w: CW, h: CH, footX: 10, footY: 26 };
    // Vista previa grande del personaje (para el editor).
    S.charPreview = function (a, dir) {
        const sheet = S.charSheet(a);
        const row = ["down", "left", "right", "up"].indexOf(dir || "down");
        const [c, x] = mk(CW, CH);
        x.drawImage(sheet, 0, row * CH, CW, CH, 0, 0, CW, CH);
        return c;
    };

    /* ---------------- MASCOTAS ---------------- */
    const PET_DEF = {
        dog: { body: "#c68a4e", dark: "#9a6431", belly: "#f0d9a2", ear: "#7a4a22", nose: "#2b1d14" },
        cat: { body: "#7a7f8c", dark: "#5a5f6b", belly: "#d8dce4", ear: "#5a5f6b", nose: "#f28ab2" },
        rabbit: { body: "#f4efe6", dark: "#d6cfc2", belly: "#ffffff", ear: "#f0b6c4", nose: "#f28ab2" }
    };
    function drawPet(type, frame) {
        const [c, x] = mk(24, 20); const d = PET_DEF[type];
        const hop = type === "rabbit" ? (frame === 1 ? -2 : 0) : 0;
        const wag = frame === 1 ? -1 : 0;
        x.save(); x.translate(2, 2 + hop);
        // sombra (no se mueve)
        x.restore(); blob(x, 12, 17, 8, 1.6, "rgba(0,0,0,.22)"); x.save(); x.translate(2, 2 + hop);
        if (type === "dog") {
            px(x, d.dark, 0, 5 + wag, 2, 2); px(x, d.dark, 1, 4 + wag, 1, 2); // cola
            px(x, d.body, 2, 6, 11, 6); px(x, d.belly, 4, 10, 7, 2);
            px(x, d.body, 11, 3, 7, 7); px(x, d.belly, 15, 7, 3, 3); px(x, d.nose, 17, 6, 2, 2);
            px(x, d.ear, 11, 2, 3, 5); px(x, "#2b1d14", 15, 5, 1, 1);
            px(x, d.dark, 3, 12 + (frame === 1 ? 0 : 1), 2, 3 - (frame === 1 ? 0 : 1)); px(x, d.dark, 10, 12 + (frame === 1 ? 1 : 0), 2, 3 - (frame === 1 ? 1 : 0));
            px(x, d.body, 6, 12 + (frame === 1 ? 1 : 0), 2, 3 - (frame === 1 ? 1 : 0)); px(x, d.body, 13, 12 + (frame === 1 ? 0 : 1), 2, 3 - (frame === 1 ? 0 : 1));
        } else if (type === "cat") {
            px(x, d.dark, 0, 2 + wag * 2, 2, 7); px(x, d.dark, 1, 1 + wag * 2, 2, 2);
            px(x, d.body, 2, 7, 10, 5); px(x, d.belly, 4, 10, 6, 2); px(x, d.dark, 4, 7, 1, 2); px(x, d.dark, 7, 7, 1, 2);
            px(x, d.body, 11, 4, 6, 6); px(x, d.dark, 11, 2, 2, 3); px(x, d.dark, 15, 2, 2, 3); px(x, d.ear, 12, 3, 1, 1); px(x, d.ear, 15, 3, 1, 1);
            px(x, "#8bd450", 13, 6, 1, 1); px(x, "#8bd450", 15, 6, 1, 1); px(x, d.nose, 14, 8, 1, 1);
            px(x, d.body, 3, 12 + (frame === 1 ? 0 : 1), 2, 3 - (frame === 1 ? 0 : 1)); px(x, d.body, 9, 12 + (frame === 1 ? 1 : 0), 2, 3 - (frame === 1 ? 1 : 0)); px(x, d.body, 12, 10 + (frame === 1 ? 1 : 0), 2, 5 - (frame === 1 ? 1 : 0));
        } else {
            px(x, d.belly, 1, 8, 3, 3);
            px(x, d.body, 2, 6, 10, 7); px(x, d.belly, 4, 11, 6, 2);
            px(x, d.body, 10, 4, 6, 6); px(x, d.body, 11, -3, 2, 7); px(x, d.body, 14, -2, 2, 6); px(x, d.ear, 11.5 | 0, -2, 1, 5); px(x, d.ear, 14, -1, 1, 4);
            px(x, "#2b1d14", 14, 6, 1, 1); px(x, d.nose, 16, 7, 1, 1);
            px(x, d.dark, 3, 12 + (frame === 1 ? -1 : 0), 4, 3); px(x, d.dark, 10, 12, 3, 3);
        }
        x.restore();
        return outline(c, x, OUT);
    }
    // Devuelve [fotograma0, fotograma1] mirando a la derecha.
    S.pet = function (type) {
        if (!S._pets[type]) S._pets[type] = [drawPet(type, 0), drawPet(type, 1)];
        return S._pets[type];
    };

    /* Utilidades que usan otros archivos */
    S.mk = mk; S.rng = rng; S.shade = shade; S.px = px; S.blob = blob;
    S.outline = (c, x) => outline(c, x, OUT); S.OUT = OUT;
})();
