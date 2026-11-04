/* ==========================================================
   areas.js — Las zonas de aprendizaje que se pueden explorar:
     · Taller de Construcción HTML  (una casa que se va construyendo)
     · Invernadero CSS              (macetas que se van pintando)
     · Campo de Máquinas JavaScript (máquinas que se van encendiendo)
   Cada lección completada cambia el lugar: ¡lo que aprendes se ve!
   Se llega caminando desde la granja; cada zona pide un nivel.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const T = 16;

    FC.AREAS = {
        html: { id: "html", name: "Taller de Construcción HTML", short: "Taller HTML", minLevel: 2, course: "html", icon: "brick", teacher: "la maestra Ladrilla" },
        css: { id: "css", name: "Invernadero CSS", short: "Invernadero CSS", minLevel: 3, course: "css", icon: "brush", teacher: "Doña Pincel" },
        js: { id: "js", name: "Campo de Máquinas JavaScript", short: "Campo JavaScript", minLevel: 4, course: "js", icon: "gear", teacher: "el ingeniero Engranaje" }
    };

    const level = () => FC.levelFromXp(FC.state.xp);
    const course = id => FC.COURSES && FC.COURSES[id];
    const done = cid => { const c = course(cid); if (!c || !FC.state) return 0; return c.lessons.filter(l => FC.state.lessons[l.id] && FC.state.lessons[l.id].done).length; };
    const total = cid => { const c = course(cid); return c ? c.lessons.length : 0; };

    const Areas = (FC.Areas = {
        locked: id => level() < FC.AREAS[id].minLevel,
        progress: done, total,
        // Entrar a una zona desde la granja (con aviso si todavía está cerrada).
        enter(id) {
            const a = FC.AREAS[id];
            if (Areas.locked(id)) {
                FC.UI.sfx("error");
                FC.UI.dialog({ icon: "lock", title: `${a.short} cerrado`, body: `Este lugar se abre en el nivel ${a.minLevel}. Ahora estás en el nivel ${level()}. ¡Cosecha, cumple misiones y aprende Python para subir de nivel!`, button: "Entendido" });
                return;
            }
            FC.Game.travel(id);
        },
        // Conversación con el maestro de cada zona (cambia según tu avance)
        talk(id) {
            const a = FC.AREAS[id], d = done(a.course), n = total(a.course);
            const T0 = {
                html: ["¡Hola, constructor! Soy la maestra Ladrilla. Aquí construimos páginas web, y las páginas se construyen con HTML, como una casa se construye con ladrillos.", "Cada lección que completes agrega una parte a esta casa: estructura, paredes, techo y detalles. ¡Mira la mesa de planos para empezar!", "¡La casa va creciendo! Ya llevas {d} de {n} lecciones. Sigue en la mesa de planos.", "¡Terminaste! La casa está lista y tú ya sabes construir páginas web. ¡Qué gran trabajo!"],
                css: ["¡Bienvenido al invernadero! Soy Doña Pincel. Una página con HTML solo es como una maceta gris: ¡CSS le da colores, tamaños y estilo!", "Cada lección que completes pinta y hace florecer estas macetas. Empieza en la mesa de pinturas.", "¡Mira cómo florecen! Llevas {d} de {n} lecciones. La mesa de pinturas te espera.", "¡Todas las macetas lucen espectaculares! Ya sabes darle estilo a una página. ¡Bravo!"],
                js: ["¡Hola, ingeniero del campo! Soy Engranaje. JavaScript es el lenguaje que le da cerebro a las páginas web: hace que las cosas pasen.", "Cada lección que completes enciende una máquina: lámparas, bomba, aspersores, cinta, molino y hasta un espantapájaros robot. Empieza en la terminal.", "¡El campo cobra vida! Llevas {d} de {n} lecciones. La terminal te espera.", "¡Todas las máquinas funcionan! Ya sabes programar en JavaScript. ¡Impresionante!"]
            }[id];
            const text = d >= n && n > 0 ? T0[3] : d === 0 ? T0[0] + "\n\n" + T0[1] : T0[2];
            FC.UI.dialog({
                icon: a.icon, title: a.teacher.charAt(0).toUpperCase() + a.teacher.slice(1), body: text.replace("{d}", d).replace("{n}", n),
                buttons: [{ text: "Cerrar" }, { text: "Ver las lecciones", primary: true, onClick: () => { setTimeout(() => FC.UI.openPanel("programming", { course: a.course }), 60); } }]
            });
        },
        openCourse(id) { FC.UI.sfx("click"); FC.UI.openPanel("programming", { course: FC.AREAS[id].course }); },

        /* ---------- Salidas en la granja ---------- */
        addFarmExits(A) {
            const S = FC.Sprites;
            const def = [
                { id: "css", rect: { x: 0, y: 204, w: 30, h: 40 }, sign: { fx: 52, fy: 204 }, back: { x: 46, y: 226, dir: "right" }, pt: { x: 54, y: 214 } },
                { id: "js", rect: { x: 482, y: 204, w: 30, h: 40 }, sign: { fx: 458, fy: 204 }, back: { x: 468, y: 226, dir: "left" }, pt: { x: 456, y: 214 } },
                { id: "html", rect: { x: 236, y: 370, w: 40, h: 14 }, sign: { fx: 226, fy: 322 }, back: { x: 256, y: 350, dir: "up" }, pt: { x: 232, y: 330 } }
            ];
            def.forEach(d => {
                const a = FC.AREAS[d.id];
                const sx = d.sign.fx - 17, sy = d.sign.fy - 35;
                A.custom(sx, sy, 34, 38, d.sign.fy, ctx => ctx.drawImage(S.areaSign(d.id, Areas.locked(d.id)), sx, sy), [d.sign.fx - 5, d.sign.fy - 6, 10, 6]);
                A.prop("exit_" + d.id, { x: d.pt.x, y: d.pt.y, r: 30, label: () => (Areas.locked(d.id) ? `${a.short} · nivel ${a.minLevel}` : `Ir al ${a.short}`), action: () => Areas.enter(d.id) });
                A.exit({ id: d.id, to: d.id, rect: d.rect, locked: () => Areas.locked(d.id) });
            });
        }
    });

    /* ---------- Ayudas de dibujo ---------- */
    const fill = (ctx, c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
    function npcDraw(app, fx, fy) {
        return (ctx, t) => {
            const sh = FC.Sprites.charSheet(app), C = FC.Sprites.CHAR, bob = Math.sin(t * 2.4) > 0.8 ? 1 : 0;
            fill(ctx, "rgba(0,0,0,.22)", fx - 5, fy - 2, 10, 3);
            ctx.drawImage(sh, 0, 0, C.w, C.h, fx - C.footX, fy - C.footY - bob, C.w, C.h);
        };
    }
    function blades(ctx, cx, cy, ang, len) {
        for (let k = 0; k < 4; k++) {
            const a = ang + k * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
            for (let r = 3; r <= len; r++) {
                const x = cx + ca * r, y = cy + sa * r;
                fill(ctx, "#7a5230", x - 1, y - 1, 2, 2);
                if (r > len * 0.45) { for (let w = 2; w <= 4; w++) fill(ctx, w === 4 ? "#d9ccaa" : "#f1e7cb", x - sa * w - 1, y + ca * w - 1, 2, 2); }
            }
        }
        fill(ctx, "#4a525a", cx - 2, cy - 2, 5, 5);
    }
    function borderTrees(A, W, H, gaps, R) {
        const PW = W * T, PH = H * T;
        const inGap = (x, y) => gaps.some(g => x > g[0] && x < g[2] && y > g[1] && y < g[3]);
        for (let x = 12; x < PW; x += 28 + ((R() * 6) | 0)) { const y = 34 + ((R() * 6) | 0); if (!inGap(x, y)) A.tree(x, y); }
        for (let x = 20; x < PW - 8; x += 28 + ((R() * 6) | 0)) { const y = PH - 6 + ((R() * 3) | 0); if (!inGap(x, y)) A.tree(x, y); }
        for (let y = 66; y < PH - 20; y += 30 + ((R() * 6) | 0)) { const x = 14 + ((R() * 4) | 0); if (!inGap(x, y)) A.tree(x, y); }
        for (let y = 56; y < PH - 20; y += 30 + ((R() * 6) | 0)) { const x = PW - 14 - ((R() * 4) | 0); if (!inGap(x, y)) A.tree(x, y); }
    }

    /* =====================================================
       TALLER HTML  (28 x 20)
       ===================================================== */
    FC.Map.builders.html = {
        name: "Taller de Construcción HTML", W: 28, H: 20, fill: FC.Map.C.GRASS, flowers: 22,
        spawn: { x: 224, y: 282, dir: "up" },
        build(A) {
            const C = A.C, S = FC.Sprites, R = A.seeded(77);
            A.rect(C.DIRT, 3, 3, 24, 16);
            A.rect(C.PLANK, 12, 11, 15, 19);   // entrada
            A.rect(C.PLANK, 4, 11, 23, 12);    // calle de tablones frente a la casa
            FC.Map.avoid = [[3, 3, 24, 16]];
            borderTrees(A, 28, 20, [[186, 270, 262, 330]], R);
            const prog = () => Areas.progress("html"), n = () => Areas.total("html");
            // La casa en construcción: una etapa por lección completada
            A.custom(166, 46, 116, 104, 144, ctx => ctx.drawImage(S.houseFrame(prog()), 166, 46), [174, 100, 100, 44]);
            // Andamio (desaparece cuando la casa está terminada)
            A.custom(294, 78, 40, 58, 136, ctx => { if (prog() < n()) ctx.drawImage(S.obj.scaffold, 294, 78); }, null);
            A.solid(300, 124, 28, 10, () => prog() < n());
            // Mesa de planos (lecciones)
            A.custom(70, 160, 50, 36, 194, ctx => ctx.drawImage(S.obj.blueprintTable, 70, 160), [74, 180, 42, 12]);
            A.prop("html_table", { x: 95, y: 204, r: 28, label: "Mesa de planos · lecciones de HTML", action: () => Areas.openCourse("html") });
            // Maestra
            A.custom(130, 160, 40, 40, 192, npcDraw(S.npcAppearance.html, 152, 192), [146, 186, 12, 6]);
            A.prop("html_npc", { x: 152, y: 198, r: 26, label: "Hablar con la maestra Ladrilla", action: () => Areas.talk("html") });
            // Decoración
            A.sprite("crate", 332, 112, 146, [334, 134, 16, 10], 1);
            A.sprite("crate", 354, 124, 144, [356, 136, 16, 8], 0);
            A.sprite("bricks", 318, 178, 192, [322, 184, 20, 8]);
            A.sprite("wheelbarrow", 52, 104, 130, [56, 120, 22, 8]);
            A.sprite("sawhorse", 300, 214, 232, [304, 224, 22, 8]);
            A.sprite("crate", 392, 196, 214, [394, 206, 16, 8], 0);
            A.bush(60, 230, 1); A.bush(396, 250, 0); A.rock(48, 160);
            A.exit({ id: "farm", to: "farm", rect: { x: 192, y: 302, w: 64, h: 18 } });
        }
    };

    /* =====================================================
       INVERNADERO CSS  (26 x 18)
       ===================================================== */
    FC.Map.builders.css = {
        name: "Invernadero CSS", W: 26, H: 18, fill: FC.Map.C.CHECK, flowers: 0, bg: "#243b30",
        spawn: { x: 208, y: 250, dir: "up" }, margin: { l: 18, t: 30, r: 18, b: 4 },
        build(A) {
            const C = A.C, S = FC.Sprites;
            A.rect(C.GLASS, 0, 0, 25, 1); A.rect(C.GLASS, 0, 0, 0, 17); A.rect(C.GLASS, 25, 0, 25, 17);
            A.rect(C.GLASS, 0, 17, 10, 17); A.rect(C.GLASS, 15, 17, 25, 17);
            const prog = () => Areas.progress("css");
            // Bancos con macetas que se pintan y florecen
            [34, 129, 224, 318].forEach((x, i) => A.custom(x, 50, 58, 40, 88, ctx => ctx.drawImage(S.bench(prog(), i), x, 50), [x + 4, 74, 50, 14]));
            // Mesa de pinturas (lecciones)
            A.custom(60, 168, 50, 36, 202, ctx => ctx.drawImage(S.obj.paintTable, 60, 168), [64, 188, 42, 12]);
            A.prop("css_table", { x: 85, y: 212, r: 28, label: "Mesa de pinturas · lecciones de CSS", action: () => Areas.openCourse("css") });
            // Caballete: el cuadro se va completando
            A.custom(124, 150, 32, 46, 194, ctx => ctx.drawImage(S.easel(prog()), 124, 150), [128, 186, 24, 8]);
            // Maestra
            A.custom(190, 170, 40, 40, 206, npcDraw(S.npcAppearance.css, 208, 206), [202, 200, 12, 6]);
            A.prop("css_npc", { x: 208, y: 212, r: 26, label: "Hablar con Doña Pincel", action: () => Areas.talk("css") });
            // Plantas grandes y regadera
            A.custom(22, 190, 34, 50, 237, ctx => ctx.drawImage(S.obj.bigPlant, 22, 190), [30, 226, 18, 10]);
            A.custom(358, 190, 34, 50, 237, ctx => ctx.drawImage(S.obj.bigPlant, 358, 190), [366, 226, 18, 10]);
            A.custom(300, 214, 24, 18, 232, ctx => ctx.drawImage(S.obj.wateringCan, 300, 214), null);
            // Destellos cuando todo está terminado
            A.custom(0, 0, 416, 288, 400, (ctx, t) => {
                if (Areas.total("css") === 0 || prog() < Areas.total("css")) return;
                for (let i = 0; i < 10; i++) { const ph = (t * 0.6 + i * 0.37) % 1, x = (i * 53 + 30) % 380 + 18, y = 40 + ph * 150; fill(ctx, "rgba(255,255,255," + (1 - ph) + ")", x, y, 2, 2); fill(ctx, "rgba(255,243,176," + (1 - ph) + ")", x + 1, y - 1, 1, 1); }
            }, null);
            A.exit({ id: "farm", to: "farm", rect: { x: 176, y: 270, w: 64, h: 18 } });
        }
    };

    /* =====================================================
       CAMPO JAVASCRIPT  (30 x 20)
       ===================================================== */
    FC.Map.builders.js = {
        name: "Campo de Máquinas JavaScript", W: 30, H: 20, fill: FC.Map.C.GRASS, flowers: 24,
        spawn: { x: 44, y: 162, dir: "right" },
        build(A) {
            const C = A.C, S = FC.Sprites, R = A.seeded(99);
            A.rect(C.PATH, 0, 9, 10, 10); A.rect(C.METAL, 10, 7, 19, 13); A.rect(C.PATH, 19, 9, 22, 10);
            A.rect(C.SOIL, 22, 12, 27, 16);
            FC.Map.avoid = [[10, 7, 19, 13], [22, 12, 27, 16]];
            borderTrees(A, 30, 20, [[0, 126, 40, 200]], R);
            const prog = () => Areas.progress("js");
            // Terminal (lecciones)
            A.custom(218, 100, 44, 44, 141, (ctx, t) => {
                ctx.drawImage(S.obj.terminal, 218, 100);
                if (Math.floor(t * 2) % 2) fill(ctx, "#6cd96c", 231, 112, 3, 1 + 1);
            }, [223, 122, 34, 20]);
            A.prop("js_terminal", { x: 240, y: 150, r: 28, label: "Terminal · lecciones de JavaScript", action: () => Areas.openCourse("js") });
            // Ingeniero
            A.custom(272, 150, 40, 40, 186, npcDraw(S.npcAppearance.js, 292, 186), [286, 180, 12, 6]);
            A.prop("js_npc", { x: 292, y: 192, r: 26, label: "Hablar con el ingeniero Engranaje", action: () => Areas.talk("js") });
            // 1) Farolas (lección 1)
            [[166, 84], [310, 84]].forEach(p => A.custom(p[0], p[1], 16, 46, p[1] + 43, (ctx, t) => {
                ctx.drawImage(S.obj.lampPost, p[0], p[1]);
                if (prog() >= 1) { FC.Sprites.blob(ctx, p[0] + 8, p[1] + 9, 18 + (Math.sin(t * 3) > 0.95 ? 1 : 0), 14, "rgba(255,240,150,.22)"); fill(ctx, "#fff3b0", p[0] + 5, p[1] + 7, 7, 4); }
            }, [p[0] + 5, p[1] + 38, 6, 5]));
            // 2) Bomba de agua (lección 2)
            A.custom(60, 200, 26, 34, 231, (ctx, t) => {
                ctx.drawImage(S.obj.pump, 60, 200);
                if (prog() >= 2) for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + i / 6) % 1; fill(ctx, i % 2 ? "#7cc0f0" : "#3f8fd6", 60 + 22 + ph * 6, 200 + 20 + ph * ph * 12, 1, 2); }
            }, [64, 222, 18, 8]);
            // 3) Aspersores + cultivos (lección 3)
            [[360, 172], [416, 172]].forEach(p => A.custom(p[0], p[1], 18, 34, p[1] + 31, (ctx, t) => {
                ctx.drawImage(S.obj.sprinkler, p[0], p[1]);
                if (prog() >= 3) for (let i = 0; i < 10; i++) { const ph = (t * 1.3 + i / 10) % 1, side = i % 2 ? 1 : -1; fill(ctx, i % 3 ? "#9fd8ff" : "#fff", p[0] + 9 + side * ph * 18, p[1] + 6 - Math.sin(ph * Math.PI) * 10 + ph * 12, 1, 2); }
            }, [p[0] + 5, p[1] + 28, 8, 4]));
            A.custom(352, 192, 112, 80, 0, ctx => {
                if (prog() < 3) return;
                for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) ctx.drawImage(S.crop.carrot[prog() >= 6 ? 3 : 2], 352 + c * 16 + 8, 192 + r * 16);
            }, null);
            // 4) Cinta transportadora (lección 4)
            A.custom(40, 66, 70, 22, 87, (ctx, t) => {
                ctx.drawImage(S.obj.conveyor, 40, 66);
                if (prog() >= 4) {
                    for (let i = 0; i < 4; i++) { const p = ((t * 14 + i * 16) % 64); ctx.drawImage(S.crop.carrot[3], 40 + 2 + p - 8, 66 - 6, 16, 16); }
                    for (let i = 0; i < 8; i++) fill(ctx, "#7a8791", 40 + 6 + ((i * 8 + t * 14) % 56), 66 + 9, 3, 1);
                }
            }, [44, 76, 62, 12]);
            // 5) Molino de viento (lección 5)
            A.custom(400, 36, 48, 70, 102, (ctx, t) => {
                ctx.drawImage(S.obj.windmillTower, 400, 36);
                blades(ctx, 424, 50, prog() >= 5 ? t * 1.6 : 0.6, 26);
            }, [412, 86, 24, 16]);
            // 6) Espantapájaros robot (lección 6)
            A.custom(420, 214, 30, 44, 251, (ctx, t) => {
                ctx.drawImage(S.obj.scarecrowBot, 420, 214);
                const on = prog() >= 6, w = on ? Math.sin(t * 6) * 5 : 0;
                fill(ctx, "#8a6238", 420 + 2, 214 + 14 + (on ? w * 0.3 : 0), 5, 2); fill(ctx, "#8a6238", 420 + 19, 214 + 14 - (on ? w * 0.3 : 0), 5, 2);
                fill(ctx, "#8a6238", 420 - 4, 214 + 12 + w, 6, 2); fill(ctx, "#8a6238", 420 + 24, 214 + 12 - w, 6, 2);
                if (on) { fill(ctx, "#6cd96c", 420 + 11, 214 + 9, 2, 1); }
            }, [426, 246, 14, 6]);
            // Detalles
            A.bush(120, 250, 1); A.bush(250, 270, 0); A.rock(180, 240); A.rock(330, 262); A.bush(60, 140, 0);
            A.exit({ id: "farm", to: "farm", rect: { x: 0, y: 140, w: 24, h: 44 } });
        }
    };
    // Dónde aparece el jugador en la granja al volver de cada zona
    Areas._farmBack = { css: { x: 46, y: 226, dir: "right" }, js: { x: 468, y: 226, dir: "left" }, html: { x: 256, y: 350, dir: "up" } };
    Areas.backSpawn = id => (Areas._farmBack && Areas._farmBack[id]) || FC.Map.builders.farm.spawn;
})();
