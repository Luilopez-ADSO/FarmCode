/* ==========================================================
   sprites_areas.js — Pixel art de las áreas nuevas:
   Taller HTML (construcción), Invernadero CSS (pintura) y
   Campo JavaScript (máquinas). Todo dibujado por código.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const S = FC.Sprites, mk = S.mk, px = S.px, blob = S.blob, rng = S.rng;
    const fin = (c, x) => S.outline(c, x);

    /* ---------------- SUELOS ---------------- */
    S.tile.dirt = [0, 1].map(v => {
        const [c, x] = mk(16, 16), r = rng(300 + v * 11);
        px(x, "#b79b6d", 0, 0, 16, 16);
        for (let i = 0; i < 14; i++) px(x, "#a38557", (r() * 16) | 0, (r() * 16) | 0, 1, 1);
        for (let i = 0; i < 8; i++) px(x, "#cdb485", (r() * 16) | 0, (r() * 16) | 0, 1, 1);
        for (let i = 0; i < 3; i++) px(x, "#8c7248", (r() * 14) | 0, (r() * 14) | 0, 2, 1);
        return c;
    });
    S.tile.plank = [0, 1].map(v => {
        const [c, x] = mk(16, 16);
        px(x, "#c99f64", 0, 0, 16, 16);
        for (let row = 0; row < 4; row++) {
            const y = row * 4;
            px(x, "#ddb77f", 0, y, 16, 1); px(x, "#8f6a3c", 0, y + 3, 16, 1);
            px(x, "#8f6a3c", ((row + v) % 2) ? 4 : 11, y, 1, 3);
            px(x, "#6b4a2a", ((row + v) % 2) ? 2 : 13, y + 1, 1, 1);
        }
        return c;
    });
    S.tile.check = [0, 1].map(v => {
        const [c, x] = mk(16, 16);
        px(x, v ? "#d6e9d3" : "#c4dcc3", 0, 0, 16, 16);
        px(x, "#a8c4a6", 15, 0, 1, 16); px(x, "#a8c4a6", 0, 15, 16, 1);
        px(x, "rgba(255,255,255,.5)", 1, 1, 5, 1); px(x, "rgba(255,255,255,.5)", 1, 1, 1, 4);
        return c;
    });
    S.tile.glass = (() => {
        const [c, x] = mk(16, 16);
        px(x, "#9fd8e8", 0, 0, 16, 16);
        px(x, "#c9eefa", 2, 2, 5, 1); px(x, "#c9eefa", 3, 3, 4, 1); px(x, "#c9eefa", 10, 8, 3, 1); px(x, "#c9eefa", 11, 9, 2, 1);
        px(x, "#7fbcd0", 0, 12, 16, 4);
        px(x, "#5f8f86", 0, 0, 16, 2); px(x, "#5f8f86", 0, 14, 16, 2); px(x, "#6fa096", 0, 0, 2, 16); px(x, "#6fa096", 14, 0, 2, 16);
        px(x, "#8fbfb4", 0, 0, 16, 1);
        return c;
    })();
    S.tile.metal = (() => {
        const [c, x] = mk(16, 16);
        px(x, "#8f9aa3", 0, 0, 16, 16); px(x, "#a7b2ba", 0, 0, 16, 1); px(x, "#a7b2ba", 0, 0, 1, 16);
        px(x, "#6c767e", 15, 0, 1, 16); px(x, "#6c767e", 0, 15, 16, 1);
        [[2, 2], [12, 2], [2, 12], [12, 12]].forEach(p => { px(x, "#5d676f", p[0], p[1], 2, 2); px(x, "#c5ced4", p[0], p[1], 1, 1); });
        return c;
    })();

    /* ---------------- ÁREA HTML: LA CASA EN CONSTRUCCIÓN ---------------- */
    const houseCache = {};
    // stage 0..5 (una etapa por cada lección de HTML completada)
    S.houseFrame = function (stage) {
        stage = Math.max(0, Math.min(5, stage | 0));
        if (houseCache[stage]) return houseCache[stage];
        const [c, x] = mk(116, 104);
        blob(x, 58, 99, 52, 4, "rgba(0,0,0,.2)");
        // cimientos
        px(x, "#9aa0a6", 8, 88, 100, 10); px(x, "#b9bfc4", 8, 88, 100, 2); px(x, "#6f757c", 8, 96, 100, 2);
        for (let i = 0; i < 7; i++) px(x, "#7e848a", 8 + i * 14, 90, 1, 6);
        if (stage >= 2) { // paredes
            px(x, "#f1dcae", 14, 48, 88, 40);
            for (let j = 54; j < 88; j += 6) px(x, "#dcc38b", 14, j, 88, 1);
        }
        if (stage >= 1) { // estructura de madera
            [12, 34, 56, 78, 100].forEach(xp => { px(x, "#a0693a", xp, 44, 4, 44); px(x, "#7a4e28", xp + 3, 44, 1, 44); px(x, "#c28a52", xp, 44, 1, 44); });
            px(x, "#b97c46", 10, 44, 96, 4); px(x, "#b97c46", 10, 64, 96, 3); px(x, "#8a5a30", 10, 47, 96, 1);
            if (stage < 2) for (let i = 0; i < 18; i++) { px(x, "#a0693a", 16 + i, 86 - i * 1.3 | 0, 2, 2); px(x, "#a0693a", 86 - i, 86 - i * 1.3 | 0, 2, 2); }
        }
        if (stage >= 2 && stage < 5) { // hueco de la puerta y las ventanas, todavía vacíos
            px(x, "#4a3524", 50, 64, 16, 24); px(x, "#4a3524", 24, 56, 14, 12); px(x, "#4a3524", 78, 56, 14, 12);
        }
        if (stage >= 3) { // esqueleto del techo
            for (let t = 0; t <= 48; t++) {
                const y1 = 44 - Math.round(t * 36 / 48);
                px(x, "#8a5a30", 10 + t, y1, 3, 3); px(x, "#8a5a30", 106 - t - 2, y1, 3, 3);
            }
            px(x, "#a0693a", 54, 6, 8, 4); px(x, "#8a5a30", 28, 30, 60, 2); px(x, "#8a5a30", 40, 18, 36, 2);
        }
        if (stage >= 4) { // tejas
            for (let j = 0; j < 38; j++) {
                const half = Math.round(50 * (j + 2) / 40), y = 6 + j;
                px(x, j % 5 < 3 ? "#b5493a" : "#a13f32", 58 - half, y, half * 2, 1);
                if (j % 5 === 0) px(x, "#d46a56", 58 - half + 1, y, half * 2 - 2, 1);
            }
            px(x, "#7e2f26", 6, 42, 104, 3); px(x, "#d46a56", 52, 4, 12, 2);
        }
        if (stage >= 5) { // detalles finales: puerta, ventanas, chimenea, flores
            px(x, "#5c3b22", 49, 63, 18, 25); px(x, "#3d7ab8", 51, 65, 14, 23); px(x, "#5a9ad8", 51, 65, 14, 2); px(x, "#f2b134", 62, 77, 2, 2);
            [[24, 56], [78, 56]].forEach(p => {
                px(x, "#7a5230", p[0] - 1, p[1] - 1, 16, 14); px(x, "#9fd8ee", p[0], p[1], 14, 12); px(x, "#c9eefa", p[0] + 1, p[1] + 1, 5, 4);
                px(x, "#7a5230", p[0] + 6, p[1], 2, 12); px(x, "#7a5230", p[0], p[1] + 5, 14, 2);
                px(x, "#8a6238", p[0] - 2, p[1] + 12, 18, 3); [2, 6, 10].forEach((o, k) => px(x, ["#f28ab2", "#f5d04c", "#fff7e0"][k], p[0] + o, p[1] + 10, 2, 2));
            });
            px(x, "#8d6e63", 80, 6, 9, 16); px(x, "#a6877c", 80, 6, 9, 2); px(x, "#6f544b", 86, 6, 3, 16);
            px(x, "#d9453a", 58, 0, 6, 4); px(x, "#7a5230", 57, 0, 1, 10);
        }
        fin(c, x);
        return (houseCache[stage] = c);
    };

    function blueprintTable() {
        const [c, x] = mk(50, 36);
        blob(x, 25, 33, 21, 2, "rgba(0,0,0,.2)");
        px(x, "#7a5230", 5, 22, 4, 12); px(x, "#7a5230", 41, 22, 4, 12);
        px(x, "#b98a52", 2, 16, 46, 8); px(x, "#d3a870", 2, 16, 46, 2); px(x, "#8a6238", 2, 22, 46, 2);
        px(x, "#3d7ab8", 6, 8, 34, 10); px(x, "#2f6fb5", 6, 16, 34, 2);
        px(x, "#cfe6ff", 9, 10, 18, 1); px(x, "#cfe6ff", 9, 13, 12, 1); px(x, "#cfe6ff", 30, 10, 7, 5); px(x, "#3d7ab8", 31, 11, 5, 3);
        blob(x, 43, 12, 3, 5, "#e8dcc0"); px(x, "#c9bb98", 41, 8, 4, 1);
        return fin(c, x);
    }
    S.obj.blueprintTable = blueprintTable();
    S.obj.crate = [0, 1].map(v => {
        const [c, x] = mk(20, v ? 34 : 20);
        const box = y => { px(x, "#b98a52", 1, y, 18, 16); px(x, "#8a6238", 1, y, 18, 2); px(x, "#8a6238", 1, y + 14, 18, 2); px(x, "#8a6238", 1, y, 2, 16); px(x, "#8a6238", 17, y, 2, 16); for (let i = 0; i < 12; i++) { px(x, "#a0723f", 4 + i, y + 3 + i, 1, 1); px(x, "#a0723f", 15 - i, y + 3 + i, 1, 1); } };
        box(v ? 16 : 2); if (v) box(1);
        return fin(c, x);
    });
    S.obj.bricks = (() => {
        const [c, x] = mk(26, 18);
        blob(x, 13, 15, 11, 2, "rgba(0,0,0,.2)");
        for (let row = 0; row < 3; row++) for (let i = 0; i < 3 - (row === 2 ? 1 : 0); i++) {
            const bx = 3 + i * 7 + (row % 2) * 3 + (row === 2 ? 4 : 0), by = 11 - row * 4;
            px(x, "#b5493a", bx, by, 6, 3); px(x, "#d46a56", bx, by, 6, 1); px(x, "#8a3329", bx, by + 2, 6, 1);
        }
        return fin(c, x);
    })();
    S.obj.wheelbarrow = (() => {
        const [c, x] = mk(30, 22);
        blob(x, 14, 20, 11, 2, "rgba(0,0,0,.2)");
        px(x, "#d9731a", 8, 6, 16, 8); px(x, "#f08a24", 8, 6, 16, 2); px(x, "#a85a12", 10, 12, 12, 2);
        px(x, "#8a6238", 2, 10, 8, 2); px(x, "#8a6238", 20, 12, 8, 2);
        blob(x, 6, 16, 3.5, 3.5, "#3a3a42"); blob(x, 6, 16, 1.2, 1.2, "#9aa0a6");
        px(x, "#7a7a82", 8, 14, 2, 4); px(x, "#9fa6ad", 12, 8, 6, 2);
        return fin(c, x);
    })();
    S.obj.sawhorse = (() => {
        const [c, x] = mk(30, 20);
        blob(x, 15, 18, 12, 2, "rgba(0,0,0,.2)");
        px(x, "#7a5230", 4, 8, 3, 9); px(x, "#7a5230", 23, 8, 3, 9); px(x, "#a0693a", 3, 5, 24, 4); px(x, "#c28a52", 3, 5, 24, 1);
        px(x, "#d8b877", 7, 2, 18, 3); px(x, "#f0d9a2", 7, 2, 18, 1);
        return fin(c, x);
    })();
    S.obj.scaffold = (() => {
        const [c, x] = mk(40, 58);
        blob(x, 20, 55, 15, 2, "rgba(0,0,0,.2)");
        [4, 32].forEach(p => px(x, "#9a6a3c", p, 6, 4, 48));
        [14, 34].forEach(y => { px(x, "#c28a52", 2, y, 36, 4); px(x, "#8a5a30", 2, y + 3, 36, 1); });
        for (let i = 0; i < 14; i++) { px(x, "#a0693a", 8 + i, 18 + i * 2 - 0, 2, 2); }
        px(x, "#d9453a", 14, 10, 8, 4);
        return fin(c, x);
    })();

    /* ---------------- ÁREA CSS: EL INVERNADERO ---------------- */
    const POT = [
        { rim: "#9aa0a6", body: "#7d838a" }, { rim: "#f08a24", body: "#d9731a" }, { rim: "#f08a24", body: "#d9731a" },
        { rim: "#fff7e0", body: "#d9731a" }, { rim: "#7cc0f0", body: "#3f8fd6" }, { rim: "#f28ab2", body: "#8e5bb5" }
    ];
    const FLOWERS = ["#f28ab2", "#f5d04c", "#fff7e0"];
    function potAt(x, ox, stage, v) {
        const p = POT[stage], fl = FLOWERS[v % 3], leaf = "#4caf50";
        // planta
        if (stage === 0) { px(x, "#8a7a3a", ox + 6, 8, 2, 6); px(x, "#a08a4a", ox + 4, 9, 2, 2); px(x, "#a08a4a", ox + 8, 8, 3, 2); }
        else {
            px(x, leaf, ox + 6, stage >= 3 ? 3 : 6, 2, stage >= 3 ? 11 : 8); px(x, "#6cc767", ox + 3, 8, 3, 2); px(x, "#6cc767", ox + 8, 6, 4, 2);
            if (stage >= 2) { blob(x, ox + 7, stage >= 3 ? 3 : 5, 3, 3, fl); px(x, "#fff3b0", ox + 6, stage >= 3 ? 2 : 4, 2, 2); }
            if (stage >= 4) { blob(x, ox + 3, 7, 2, 2, FLOWERS[(v + 1) % 3]); blob(x, ox + 11, 8, 2, 2, FLOWERS[(v + 2) % 3]); }
            if (stage === 5) { px(x, "#ffffff", ox + 1, 2, 1, 1); px(x, "#ffffff", ox + 13, 5, 1, 1); px(x, "#fff3b0", ox + 12, 1, 1, 1); }
        }
        // maceta
        const top = 14;
        px(x, p.rim, ox + 1, top, 12, 3);
        px(x, p.body, ox + 2, top + 3, 10, 6); px(x, p.body, ox + 3, top + 9, 8, 1);
        px(x, "rgba(255,255,255,.35)", ox + 2, top + 3, 2, 5);
        if (stage === 3) { px(x, "#fff7e0", ox + 2, top + 5, 10, 2); }
        if (stage === 4) { px(x, "#2f6fb5", ox + 3, top + 8, 8, 2); px(x, "#9fd8ff", ox + 2, top + 3, 2, 4); }
        if (stage === 5) { ["#d9453a", "#f5d04c", "#4caf50", "#5ab0e8"].forEach((cl, i) => px(x, cl, ox + 2, top + 3 + i * 1.5 | 0, 10, 2)); }
    }
    const benchCache = {};
    S.bench = function (stage, v0) {
        const key = stage + "_" + v0;
        if (benchCache[key]) return benchCache[key];
        const [c, x] = mk(58, 40);
        blob(x, 29, 37, 25, 2, "rgba(0,0,0,.2)");
        px(x, "#7a5230", 5, 30, 4, 8); px(x, "#7a5230", 49, 30, 4, 8);
        px(x, "#b98a52", 2, 26, 54, 6); px(x, "#d3a870", 2, 26, 54, 2); px(x, "#8a6238", 2, 30, 54, 2);
        [3, 22, 41].forEach((ox, i) => { const [pc, px2] = mk(16, 20); potAt(px2, 1, stage, v0 + i); x.drawImage(pc, ox, 8); });
        return (benchCache[key] = fin(c, x));
    };
    S.obj.paintTable = (() => {
        const [c, x] = mk(50, 36);
        blob(x, 25, 33, 21, 2, "rgba(0,0,0,.2)");
        px(x, "#7a5230", 5, 22, 4, 12); px(x, "#7a5230", 41, 22, 4, 12);
        px(x, "#b98a52", 2, 16, 46, 8); px(x, "#d3a870", 2, 16, 46, 2); px(x, "#8a6238", 2, 22, 46, 2);
        // paleta
        blob(x, 14, 12, 9, 4, "#e8d8b0"); [["#d9453a", 8, 11], ["#f5d04c", 12, 9], ["#4caf50", 17, 9], ["#3d7ab8", 21, 11]].forEach(p => blob(x, p[1], p[2], 1.6, 1.4, p[0]));
        // botes de pintura
        [["#d9453a", 31], ["#3d7ab8", 37], ["#f5d04c", 43]].forEach(p => { px(x, "#cfd4d8", p[1] - 2, 8, 6, 8); px(x, p[0], p[1] - 2, 6, 6, 3); px(x, "#9aa0a6", p[1] - 2, 15, 6, 1); });
        px(x, "#8a6238", 24, 5, 1, 9); px(x, "#d9453a", 23, 3, 3, 3);
        return fin(c, x);
    })();
    const easelCache = {};
    S.easel = function (stage) {
        stage = Math.max(0, Math.min(5, stage | 0));
        if (easelCache[stage]) return easelCache[stage];
        const [c, x] = mk(32, 46);
        blob(x, 16, 43, 12, 2, "rgba(0,0,0,.2)");
        px(x, "#8a6238", 6, 22, 3, 22); px(x, "#8a6238", 23, 22, 3, 22); px(x, "#7a5230", 15, 22, 2, 18);
        px(x, "#b98a52", 3, 28, 26, 3);
        px(x, "#7a5230", 4, 3, 24, 24); px(x, "#fffdf2", 6, 5, 20, 20);
        if (stage >= 1) px(x, "#9fd8ee", 6, 5, 20, 10);
        if (stage >= 2) blob(x, 21, 9, 3, 3, "#f5d04c");
        if (stage >= 3) { blob(x, 11, 25, 9, 6, "#6cc767"); px(x, "#fffdf2", 6, 25, 20, 1); }
        if (stage >= 4) { px(x, "#3e9a45", 13, 15, 1, 6); blob(x, 13, 14, 2, 2, "#f28ab2"); }
        if (stage >= 5) { for (let i = 0; i < 9; i++) { const yy = 8 + Math.round(Math.sin(i / 8 * Math.PI) * -4); px(x, ["#d9453a", "#f08a24", "#f5d04c"][0], 8 + i, yy + 4, 1, 1); px(x, "#5ab0e8", 8 + i, yy + 6, 1, 1); } }
        return (easelCache[stage] = fin(c, x));
    };
    S.obj.bigPlant = (() => {
        const [c, x] = mk(34, 50);
        blob(x, 17, 47, 12, 2, "rgba(0,0,0,.2)");
        const leaves = [[17, 14, 8, 11], [8, 22, 7, 8], [26, 22, 7, 8], [12, 30, 7, 6], [23, 31, 7, 6]];
        leaves.forEach(l => blob(x, l[0], l[1], l[2], l[3], "#2f7a3a")); leaves.forEach(l => blob(x, l[0] - 1, l[1] - 1, l[2] - 2, l[3] - 2, "#4caf50"));
        px(x, "#6cc767", 14, 8, 2, 4); px(x, "#6cc767", 6, 19, 2, 3);
        px(x, "#a85a12", 8, 36, 18, 3); px(x, "#d9731a", 9, 39, 16, 8); px(x, "#f08a24", 8, 36, 18, 2);
        return fin(c, x);
    })();
    S.obj.wateringCan = (() => {
        const [c, x] = mk(24, 18);
        px(x, "#5ab0e8", 4, 6, 12, 8); px(x, "#9fd8ff", 4, 6, 12, 2); px(x, "#3d7ab8", 4, 12, 12, 2);
        px(x, "#5ab0e8", 16, 4, 6, 2); px(x, "#5ab0e8", 20, 2, 3, 3); px(x, "#3d7ab8", 6, 3, 8, 2);
        return fin(c, x);
    })();

    /* ---------------- ÁREA JS: EL CAMPO DE MÁQUINAS ---------------- */
    S.obj.windmillTower = (() => {
        const [c, x] = mk(48, 70);
        blob(x, 24, 66, 17, 3, "rgba(0,0,0,.2)");
        for (let j = 0; j < 46; j++) {
            const half = Math.round(8 + j * 0.16 * 1.0 + 6 * (j / 46)), y = 20 + j;
            px(x, j % 6 < 3 ? "#e8dcc0" : "#d9ccaa", 24 - half, y, half * 2, 1);
            px(x, "#b5a47e", 24 + half - 3, y, 3, 1);
        }
        px(x, "#7a5230", 20, 52, 8, 14);
        px(x, "#5a3a20", 20, 52, 8, 2);
        px(x, "#7e2f26", 12, 14, 24, 5); px(x, "#b5493a", 14, 10, 20, 5); px(x, "#d46a56", 18, 6, 12, 4);
        blob(x, 24, 14, 3, 3, "#6f757c");
        return fin(c, x);
    })();
    S.obj.pump = (() => {
        const [c, x] = mk(26, 34);
        blob(x, 13, 31, 10, 2, "rgba(0,0,0,.2)");
        px(x, "#6f757c", 6, 24, 14, 6); px(x, "#9aa0a6", 6, 24, 14, 2);
        px(x, "#3d7ab8", 9, 8, 8, 17); px(x, "#5a9ad8", 9, 8, 3, 17);
        px(x, "#2f6fb5", 8, 6, 10, 4); px(x, "#d9453a", 20, 7, 4, 2); px(x, "#9aa0a6", 17, 14, 7, 3); px(x, "#9aa0a6", 22, 16, 2, 5);
        return fin(c, x);
    })();
    S.obj.sprinkler = (() => {
        const [c, x] = mk(18, 34);
        blob(x, 9, 31, 7, 2, "rgba(0,0,0,.2)");
        px(x, "#6f757c", 7, 10, 4, 21); px(x, "#9aa0a6", 7, 10, 1, 21);
        px(x, "#3d7ab8", 4, 5, 10, 5); px(x, "#5a9ad8", 4, 5, 10, 2); px(x, "#6f757c", 5, 28, 8, 3);
        return fin(c, x);
    })();
    S.obj.conveyor = (() => {
        const [c, x] = mk(70, 22);
        blob(x, 35, 19, 30, 2, "rgba(0,0,0,.2)");
        px(x, "#5c6770", 2, 8, 66, 8); px(x, "#7a8791", 2, 8, 66, 2); px(x, "#3d464d", 2, 14, 66, 2);
        [6, 64].forEach(p => { blob(x, p, 12, 5, 5, "#3a3a42"); blob(x, p, 12, 2, 2, "#9aa0a6"); });
        px(x, "#6f757c", 12, 16, 3, 4); px(x, "#6f757c", 55, 16, 3, 4);
        return fin(c, x);
    })();
    S.obj.terminal = (() => {
        const [c, x] = mk(44, 44);
        blob(x, 22, 41, 18, 3, "rgba(0,0,0,.2)");
        px(x, "#6f7a83", 5, 22, 34, 18); px(x, "#8f9aa3", 5, 22, 34, 2); px(x, "#59636b", 5, 38, 34, 2);
        px(x, "#59636b", 8, 4, 28, 20); px(x, "#8f9aa3", 8, 4, 28, 2);
        px(x, "#0f1f14", 11, 7, 22, 14);
        px(x, "#3a4a3a", 11, 7, 22, 1);
        [["#6cd96c", 13, 9, 8], ["#6cd96c", 13, 12, 14], ["#9fe8ff", 13, 15, 6]].forEach(p => px(x, p[0], p[1], p[2], p[3], 1));
        [["#d9453a", 10], ["#f5d04c", 16], ["#6cd96c", 22]].forEach(p => px(x, p[0], p[1] + 2, 28, 3, 3));
        px(x, "#3d464d", 12, 32, 20, 3);
        return fin(c, x);
    })();
    S.obj.lampPost = (() => {
        const [c, x] = mk(16, 46);
        blob(x, 8, 43, 6, 2, "rgba(0,0,0,.2)");
        px(x, "#4a525a", 7, 12, 3, 31); px(x, "#6f7a83", 7, 12, 1, 31); px(x, "#4a525a", 4, 40, 9, 3);
        px(x, "#4a525a", 4, 6, 9, 6); px(x, "#6f7a83", 4, 6, 9, 2);
        px(x, "#c9c9c9", 5, 7, 7, 4);
        return fin(c, x);
    })();
    S.obj.scarecrowBot = (() => {
        const [c, x] = mk(26, 40);
        blob(x, 13, 37, 8, 2, "rgba(0,0,0,.2)");
        px(x, "#8a6238", 12, 18, 3, 19);
        px(x, "#8f9aa3", 8, 12, 11, 10); px(x, "#a7b2ba", 8, 12, 11, 2); px(x, "#6c767e", 8, 20, 11, 2);
        px(x, "#e3b84a", 3, 5, 21, 2); px(x, "#e3b84a", 8, 1, 11, 5); px(x, "#d9453a", 8, 4, 11, 1);
        px(x, "#8f9aa3", 9, 6, 9, 7); px(x, "#0f1f14", 10, 8, 7, 3); px(x, "#6cd96c", 11, 9, 2, 1); px(x, "#6cd96c", 14, 9, 2, 1);
        return fin(c, x);
    })();

    /* ---------------- LETREROS DE ENTRADA (en la granja) ---------------- */
    const SIGN_COL = { html: "#e07a2f", css: "#8b62b3", js: "#3d7ab8" };
    S.areaSign = function (kind, locked) {
        const key = "areaSign_" + kind + (locked ? "L" : "");
        if (S._pets[key]) return S._pets[key];
        const [c, x] = mk(34, 38);
        blob(x, 17, 35, 10, 2, "rgba(0,0,0,.2)");
        px(x, "#7a5230", 15, 16, 4, 19); px(x, "#5c3b22", 17, 16, 2, 19);
        px(x, SIGN_COL[kind], 3, 2, 28, 18); px(x, "rgba(255,255,255,.3)", 3, 2, 28, 2); px(x, "rgba(0,0,0,.25)", 3, 18, 28, 2);
        px(x, "#fff7e0", 6, 5, 22, 12);
        const icon = S.iconCanvas(locked ? "lock" : ({ html: "brick", css: "brush", js: "gear" })[kind]);
        x.imageSmoothingEnabled = false; x.drawImage(icon, 13, 5, 8, 8); x.drawImage(icon, 13, 5, 8, 8);
        px(x, SIGN_COL[kind], 8, 14, 18, 2);
        fin(c, x);
        return (S._pets[key] = c);
    };
    S.npcAppearance = {
        html: { skin: "#d9a073", hairStyle: "coleta", hairColor: "#2b1d14", shirt: "#d8a72f", pants: "#6b4a2e", hat: "casco", accessory: "ninguno" },
        css: { skin: "#f8d9b9", hairStyle: "rizado", hairColor: "#c9452a", shirt: "#8b62b3", pants: "#3a3a42", hat: "boina", accessory: "bufanda" },
        js: { skin: "#8a5a36", hairStyle: "corto", hairColor: "#2b1d14", shirt: "#e8e1d0", pants: "#3f5aa0", hat: "gorra", accessory: "gafas" }
    };
})();
