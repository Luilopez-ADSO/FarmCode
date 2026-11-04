/* ==========================================================
   map.js — Los mapas del juego (casillas de 16 px)
   Hay varias ÁREAS: la granja y las zonas de aprendizaje.
   Cada área tiene un "constructor" (FC.Map.builders.<id>) que
   define terreno, objetos, parcelas, colisiones y salidas.
   FC.Map.load("farm"|"html"|...) cambia de área.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const T = 16;
    const C = { GRASS: 0, PATH: 1, WATER: 2, SAND: 3, SOIL: 4, DIRT: 5, PLANK: 6, CHECK: 7, GLASS: 8, METAL: 9 };
    const M = (FC.Map = {
        T, C, builders: {}, area: null, W: 0, H: 0, PW: 0, PH: 0,
        ground: [], objects: [], plots: [], solids: [], props: {}, zones: {}, exits: [],
        margin: { l: 10, t: 26, r: 10, b: 4 }, avoid: [], current: null
    });

    function seeded(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

    /* ---------- Herramientas que reciben los constructores de áreas ---------- */
    function makeAPI(g) {
        const A = {
            g, C, T, seeded,
            rect(code, x0, y0, x1, y1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] !== undefined) g[y][x] = code; },
            add(o) { M.objects.push(o); return o; },
            solid(x, y, w, h, active) { const s = { x, y, w, h, active }; M.solids.push(s); return s; },
            prop(id, def) { M.props[id] = Object.assign({ id }, def); return M.props[id]; },
            zone(id, r) { M.zones[id] = r; },
            plot(id, tx, ty, advanced) { const p = { id, tx, ty, px: tx * T, py: ty * T, advanced: !!advanced }; M.plots.push(p); g[ty][tx] = C.SOIL; return p; },
            // Salida a otra área. rect en píxeles. locked(): devuelve true si está bloqueada.
            exit(def) {
                M.exits.push(def);
                if (def.locked) A.solid(def.rect.x, def.rect.y, def.rect.w, def.rect.h, def.locked);
                return def;
            },
            fenceRing(x0, y0, x1, y1, skip) {
                const isSkipped = (x, y) => (skip || []).some(s => s[0] === x && s[1] === y);
                for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
                    const edge = x === x0 || x === x1 || y === y0 || y === y1;
                    if (!edge || isSkipped(x, y)) continue;
                    const horizontal = (y === y0 || y === y1) && x !== x0 && x !== x1;
                    A.add({ type: "fence", sprite: horizontal ? "fenceH" : "fenceV", x: x * T - 1, y: y * T - 3, sortY: y * T + 14 });
                    if (horizontal) A.solid(x * T, y * T + 6, T, 8); else A.solid(x * T + 4, y * T, 8, T);
                }
            },
            tree(fx, fy, variant) {
                A.add({ type: "tree", sprite: "tree", variant: variant === undefined ? ((fx * 7 + fy * 3) % 4) : variant, x: fx - 19, y: fy - 42, sortY: fy });
                A.solid(fx - 4, fy - 6, 8, 5);
            },
            bush(fx, fy, variant) {
                A.add({ type: "bush", sprite: "bush", variant: variant || 0, x: fx - 10, y: fy - 14, sortY: fy });
                A.solid(fx - 8, fy - 6, 16, 6);
            },
            rock(fx, fy) {
                A.add({ type: "rock", sprite: "rock", x: fx - 9, y: fy - 12, sortY: fy });
                A.solid(fx - 7, fy - 6, 14, 6);
            },
            // Objeto con sprite fijo: (x,y) = esquina superior izquierda del dibujo, foot = y de los pies (orden de dibujo)
            sprite(key, x, y, foot, solidRect, variant) {
                const o = A.add({ type: key, sprite: key, variant, x, y, sortY: foot });
                if (solidRect) A.solid(solidRect[0], solidRect[1], solidRect[2], solidRect[3]);
                return o;
            },
            // Objeto con dibujo propio (animaciones). x,y,w,h = caja para no dibujarlo fuera de la pantalla.
            custom(x, y, w, h, foot, draw, solidRect) {
                const o = A.add({ type: "custom", x, y, w, h, sortY: foot, draw });
                if (solidRect) A.solid(solidRect[0], solidRect[1], solidRect[2], solidRect[3]);
                return o;
            }
        };
        return A;
    }

    /* =====================================================
       LA GRANJA
       ===================================================== */
    M.builders.farm = {
        name: "Mi granja", W: 32, H: 24, fill: C.GRASS, flowers: 46,
        spawn: { x: 150, y: 214 },
        build(A) {
            const g = A.g, R = seeded(2024);
            const { PATH, WATER, SAND } = C;
            /* Caminos */
            A.rect(PATH, 0, 13, 31, 14);   // camino principal (llega a los dos bordes: salidas a las zonas)
            A.rect(PATH, 23, 6, 24, 12);   // camino desde la casa
            A.rect(PATH, 8, 10, 9, 12);    // camino desde el huerto de Python
            A.rect(PATH, 15, 15, 16, 23);  // camino hacia el sur (Taller HTML)
            /* Estanque */
            A.rect(SAND, 3, 16, 9, 21); A.rect(WATER, 4, 17, 8, 20);
            [[4, 17], [8, 17], [4, 20], [8, 20]].forEach(([x, y]) => (g[y][x] = SAND));
            /* Parcelas */
            [6, 8].forEach((ty, r) => [7, 8, 9, 10].forEach((tx, c) => A.plot("s" + (r * 4 + c + 1), tx, ty, false)));
            [16, 18].forEach((ty, r) => [19, 20, 21, 22].forEach((tx, c) => A.plot("x" + (r * 4 + c + 1), tx, ty, true)));
            A.zone("field", { x: 5 * T, y: 4 * T, w: 8 * T, h: 7 * T });
            A.zone("advanced", { x: 17 * T, y: 15 * T, w: 12 * T, h: 6 * T });
            M.avoid = [[5, 4, 12, 10], [17, 15, 28, 20], [21, 0, 25, 6], [13, 15, 18, 23]];

            /* Cercas y portón */
            A.fenceRing(5, 4, 12, 10, [[8, 10], [9, 10]]);
            A.fenceRing(17, 15, 28, 20, [[22, 15], [23, 15]]);
            const gate = A.add({ type: "gate", x: 22 * T - 1, y: 15 * T - 3, sortY: 15 * T + 14, sprite: () => (FC.state && FC.state.flags.gateOpen ? "gateOpen" : "gateClosed") });
            A.solid(22 * T, 15 * T + 6, 2 * T, 8, () => !(FC.state && FC.state.flags.gateOpen));
            A.prop("gate", { x: 23 * T, y: 15 * T + 26, r: 26, obj: gate });

            /* Casa, mercado, tablón, letrero, pozo */
            A.add({ type: "house", sprite: "house", x: 334, y: 30, sortY: 101 }); A.solid(340, 62, 72, 36);
            A.prop("door", { x: 376, y: 106, r: 22 });
            A.add({ type: "stall", sprite: "stall", x: 322, y: 145, sortY: 186 }); A.solid(326, 172, 36, 13);
            A.prop("stall", { x: 344, y: 194, r: 26 });
            A.add({ type: "board", sprite: "board", x: 296, y: 90, sortY: 122 }); A.solid(304, 112, 20, 9);
            A.prop("board", { x: 314, y: 130, r: 24 });
            A.add({ type: "sign", sprite: "sign", x: 157, y: 173, sortY: 201 }); A.solid(167, 194, 8, 6);
            A.prop("sign", { x: 172, y: 208, r: 22 });
            A.add({ type: "well", sprite: "well", x: 218, y: 160, sortY: 192 }); A.solid(222, 182, 20, 9);
            A.prop("well", { x: 232, y: 200, r: 22 });

            /* Árboles del borde (con huecos donde están las salidas) */
            let idx = 0;
            const treeAt = (fx, fy) => { const kind = (idx++ % 3 === 2 || R() > 0.75) ? 2 + ((R() * 2) | 0) : (R() * 2) | 0; A.tree(fx, fy, kind); };
            for (let x = 12; x < M.PW; x += 29 + ((R() * 6) | 0)) { if (x > 322 && x < 430) continue; treeAt(x, 34 + ((R() * 6) | 0)); }
            for (let x = 20; x < M.PW - 8; x += 29 + ((R() * 6) | 0)) { const fy = 378 + ((R() * 4) | 0); if (x > 214 && x < 298) continue; treeAt(x, fy); }
            for (let y = 70; y < 372; y += 32 + ((R() * 6) | 0)) { const fx = 14 + ((R() * 4) | 0); if (y > 176 && y < 270) continue; treeAt(fx, y); }
            for (let y = 56; y < 372; y += 32 + ((R() * 6) | 0)) { const fx = M.PW - 14 - ((R() * 4) | 0); if (y > 176 && y < 270) continue; treeAt(fx, y); }
            [[262, 120], [446, 96], [452, 190], [208, 262], [214, 340], [476, 336], [176, 304]].forEach(p => treeAt(p[0], p[1]));
            [[222, 140, 0], [200, 292, 1], [210, 350, 0], [330, 352, 1], [40, 304, 0], [440, 258, 1], [316, 64, 0], [470, 118, 1], [184, 366, 1]].forEach(p => A.bush(p[0], p[1], p[2]));
            [[226, 262], [140, 362], [482, 300], [28, 150]].forEach(p => A.rock(p[0], p[1]));

            if (FC.Areas) FC.Areas.addFarmExits(A);
        }
    };

    /* =====================================================
       DIBUJO DEL TERRENO (se pre-dibuja una sola vez por área)
       ===================================================== */
    function renderGround(waterFrame) {
        const g = M.ground, W = M.W, H = M.H, Sp = FC.Sprites, [c, x] = Sp.mk(W * T, H * T);
        const { GRASS, PATH, WATER, SAND, DIRT, PLANK, CHECK, GLASS, METAL } = C;
        const at = (tx, ty) => (tx < 0 || ty < 0 || tx >= W || ty >= H) ? -1 : g[ty][tx];
        for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
            const code = g[ty][tx], X = tx * T, Y = ty * T;
            let tile;
            if (code === GRASS) tile = Sp.tile.grass[(tx * 7 + ty * 13 + ((tx * ty) % 5)) % 4];
            else if (code === PATH) tile = Sp.tile.path[(tx + ty * 3) % 3];
            else if (code === WATER) tile = Sp.tile.water[waterFrame];
            else if (code === SAND) tile = Sp.tile.sand;
            else if (code === DIRT) tile = Sp.tile.dirt[(tx + ty) % 2];
            else if (code === PLANK) tile = Sp.tile.plank[(tx + ty) % 2];
            else if (code === CHECK) tile = Sp.tile.check[(tx + ty) % 2];
            else if (code === GLASS) tile = Sp.tile.glass;
            else if (code === METAL) tile = Sp.tile.metal;
            else { x.drawImage(Sp.tile.grass[0], X, Y); tile = Sp.tile.soil; }
            x.drawImage(tile, X, Y);
            const edge = (color, test) => {
                x.fillStyle = color;
                if (test(at(tx, ty - 1))) x.fillRect(X, Y, T, 1);
                if (test(at(tx, ty + 1))) x.fillRect(X, Y + T - 1, T, 1);
                if (test(at(tx - 1, ty))) x.fillRect(X, Y, 1, T);
                if (test(at(tx + 1, ty))) x.fillRect(X + T - 1, Y, 1, T);
            };
            if (code === PATH) edge("#b8925a", n => n !== -1 && n !== PATH && n !== PLANK);
            else if (code === SAND) edge("#cdb56e", n => n === GRASS || n === PATH);
            else if (code === DIRT) edge("#8c7248", n => n === GRASS);
            else if (code === PLANK) edge("#6b4a2a", n => n !== -1 && n !== PLANK);
            else if (code === METAL) edge("#59636b", n => n !== -1 && n !== METAL);
            else if (code === WATER) {
                x.fillStyle = "#d6efff";
                if (at(tx, ty - 1) !== WATER) x.fillRect(X, Y, T, 1);
                if (at(tx - 1, ty) !== WATER) x.fillRect(X, Y, 1, T);
                x.fillStyle = "#2a6fb0";
                if (at(tx, ty + 1) !== WATER) x.fillRect(X, Y + T - 1, T, 1);
                if (at(tx + 1, ty) !== WATER) x.fillRect(X + T - 1, Y, 1, T);
            }
        }
        // Flores decorativas (solo sobre hierba libre)
        const count = M.current.flowers || 0;
        if (count) {
            const flowerR = seeded(31 + W), used = new Set();
            let placed = 0, tries = 0;
            while (placed < count && tries++ < 1200) {
                const tx = 2 + ((flowerR() * (W - 4)) | 0), ty = 2 + ((flowerR() * (H - 4)) | 0);
                if (at(tx, ty) !== GRASS || used.has(tx + "," + ty)) continue;
                if (M.avoid.some(a => tx >= a[0] && tx <= a[2] && ty >= a[1] && ty <= a[3]) && flowerR() > 0.15) continue;
                used.add(tx + "," + ty);
                x.drawImage(Sp.obj.flowers[(flowerR() * 5) | 0], tx * T, ty * T);
                placed++;
            }
        }
        return c;
    }

    /* ---------- Cargar un área ---------- */
    M.load = function (id) {
        let b = M.builders[id];
        if (!b) { id = "farm"; b = M.builders.farm; }
        M.current = b; M.area = id; M.W = b.W; M.H = b.H; M.PW = b.W * T; M.PH = b.H * T;
        M.objects = []; M.solids = []; M.plots = []; M.props = {}; M.zones = {}; M.exits = []; M.avoid = [];
        M.margin = Object.assign({ l: 10, t: 26, r: 10, b: 4 }, b.margin || {});
        M.ground = Array.from({ length: b.H }, () => Array(b.W).fill(b.fill === undefined ? C.GRASS : b.fill));
        const A = makeAPI(M.ground);
        b.build(A);
        // Agua y cristal siempre son sólidos
        let hasWater = false;
        for (let y = 0; y < b.H; y++) for (let x = 0; x < b.W; x++) {
            const code = M.ground[y][x];
            if (code === C.WATER) { hasWater = true; A.solid(x * T, y * T, T, T); }
            else if (code === C.GLASS) A.solid(x * T, y * T, T, T);
        }
        const f0 = renderGround(0);
        M.groundImg = [f0, hasWater ? renderGround(1) : f0];
        M.objects.sort((a, c) => a.sortY - c.sortY);
        return M;
    };
    M.init = function () { return M.load((FC.state && FC.state.area) || "farm"); };

    /* ---------- Colisiones ---------- */
    // Devuelve true si el rectángulo choca con algo sólido.
    M.collides = function (x, y, w, h) {
        const mg = M.margin;
        if (x < mg.l || y < mg.t || x + w > M.PW - mg.r || y + h > M.PH - mg.b) return true;
        for (let i = 0; i < M.solids.length; i++) {
            const s = M.solids[i];
            if (s.active && !s.active()) continue;
            if (x < s.x + s.w && x + w > s.x && y < s.y + s.h && y + h > s.y) return true;
        }
        return false;
    };
    M.plotAt = id => M.plots.find(p => p.id === id);
})();
