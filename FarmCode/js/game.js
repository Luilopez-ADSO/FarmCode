/* ==========================================================
   game.js — El motor: bucle del juego, cámara, controles,
   interacción con la granja y dibujo del mundo.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const $ = s => document.querySelector(s);
    const T = 16;

    let canvas, ctx, dpr = 1, scale = 3, viewW = 0, viewH = 0;
    const cam = { x: 0, y: 0 };
    let last = 0, time = 0, saveT = 0, target = null, actCooldown = 0, traveling = false;
    const keys = {}, vdir = { up: false, down: false, left: false, right: false };
    let particles = [], smokeT = 0;
    const inZone = {};

    const TIPS = [
        "Una variable es un nombre que guarda un dato. En Python: semillas = 3.",
        "Riega cada planta una vez: crecerá más rápido y dará el doble de cosecha.",
        "Un ciclo for repite una tarea sin que tengas que escribirla muchas veces.",
        "Los textos en Python van entre comillas: \"zanahoria\".",
        "Si el programa no sale como esperabas, ¡no pasa nada! Leer el error es parte de aprender.",
        "Una función es como una receta: la escribes una vez y la usas cuando quieras.",
        "En Python la sangría (los espacios al inicio) es importante: indica qué instrucciones van juntas.",
        "Vende tus cosechas en el mercado y compra semillas nuevas para crecer más rápido."
    ];

    /* ---------- Tamaño y cámara ---------- */
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 3);
        const cw = window.innerWidth, ch = window.innerHeight;
        const long = Math.max(cw, ch);
        const zoom = Math.max(2, Math.min(6, Math.round(long / 440)));
        scale = Math.max(1, Math.round(zoom * dpr));
        canvas.style.width = cw + "px"; canvas.style.height = ch + "px";
        canvas.width = Math.floor(cw * dpr); canvas.height = Math.floor(ch * dpr);
        viewW = canvas.width / scale; viewH = canvas.height / scale;
        ctx.imageSmoothingEnabled = false;
    }
    function updateCamera(snap) {
        const M = FC.Map, P = FC.Player;
        let tx = viewW >= M.PW ? (M.PW - viewW) / 2 : Math.max(0, Math.min(M.PW - viewW, P.x - viewW / 2));
        let ty = viewH >= M.PH ? (M.PH - viewH) / 2 : Math.max(0, Math.min(M.PH - viewH, P.y - 12 - viewH / 2));
        if (snap) { cam.x = tx; cam.y = ty; } else { cam.x += (tx - cam.x) * 0.14; cam.y += (ty - cam.y) * 0.14; }
    }
    function toScreen(wx, wy) { return { x: (wx - Math.round(cam.x)) * scale / dpr, y: (wy - Math.round(cam.y)) * scale / dpr }; }

    /* ---------- Partículas ---------- */
    function burst(x, y, colors, n, spread) {
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, s = 14 + Math.random() * (spread || 34);
            particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 18, life: 0.5 + Math.random() * 0.4, age: 0, c: colors[(Math.random() * colors.length) | 0], s: Math.random() < 0.4 ? 2 : 1, g: 70 });
        }
    }
    function drops(x, y) {
        for (let i = 0; i < 9; i++) particles.push({ x: x - 6 + Math.random() * 12, y: y - 14 - Math.random() * 6, vx: 0, vy: 10 + Math.random() * 20, life: 0.5, age: 0, c: Math.random() < 0.5 ? "#7cc0f0" : "#3f8fd6", s: 1, g: 90 });
    }
    function updateParticles(dt) {
        particles.forEach(p => { p.age += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; });
        particles = particles.filter(p => p.age < p.life);
        smokeT -= dt;
        if (smokeT <= 0 && FC.Map.area === "farm") { smokeT = 0.7; particles.push({ x: 334 + 60 + 4, y: 34, vx: 3 + Math.random() * 3, vy: -9, life: 2.2, age: 0, c: "rgba(235,235,235,.75)", s: 3, g: -1, smoke: true }); }
    }
    function drawParticles() {
        particles.forEach(p => {
            const k = 1 - p.age / p.life;
            ctx.globalAlpha = p.smoke ? Math.max(0, k * 0.8) : Math.min(1, k * 2);
            ctx.fillStyle = p.smoke ? "#e9ecef" : p.c;
            const sz = p.smoke ? 2 + Math.floor((1 - k) * 4) : p.s;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), sz, sz);
        });
        ctx.globalAlpha = 1;
    }

    /* ---------- Interacción ---------- */
    function cropLabel() { const id = FC.state.selectedSeed; return FC.CROPS[id].name.toLowerCase(); }
    function findTarget() {
        const P = FC.Player, M = FC.Map, fp = P.facePoint(10);
        let best = null;
        M.plots.forEach(p => {
            if (!FC.Farming.isUnlocked(p)) return;
            const cx = p.px + 8, cy = p.py + 8, d = Math.hypot(fp.x - cx, fp.y - cy);
            if (d <= 14 && (!best || d < best.d)) best = { kind: "plot", plot: p, d, x: cx, y: p.py };
        });
        Object.values(M.props).forEach(pr => {
            const d = Math.hypot(P.x - pr.x, (P.y - 4) - pr.y);
            if (d <= pr.r && (!best || d - 8 < best.d)) best = { kind: pr.id, d: d - 8, x: pr.x, y: pr.y - 28, prop: pr };
        });
        return best;
    }
    function labelFor(t) {
        if (!t) return "";
        if (t.prop && t.prop.label) return typeof t.prop.label === "function" ? t.prop.label() : t.prop.label;
        if (t.kind === "plot") {
            const inf = FC.Farming.info(t.plot.id);
            if (inf.empty) return FC.Inventory.seeds(FC.state.selectedSeed) > 0 ? `Sembrar ${cropLabel()}` : "Sin semillas (mira el mercado)";
            if (inf.ready) return `Cosechar ${inf.def.name.toLowerCase()}`;
            return inf.watered ? `${inf.def.name} creciendo · ${inf.remainingSec} s` : `Regar ${inf.def.name.toLowerCase()}`;
        }
        return { door: "Entrar a casa", stall: "Mercado", board: "Tablón de misiones", sign: "Huerto de Python", gate: FC.state.flags.gateOpen ? "Huerto avanzado (abierto)" : "Portón del huerto avanzado", well: "Pozo de consejos" }[t.kind] || "";
    }
    function interact() {
        if (actCooldown > 0 || FC.UI.blocking()) return;
        const t = findTarget(); if (!t) return;
        const P = FC.Player;
        if (t.kind === "plot") {
            const id = t.plot.id, inf = FC.Farming.info(id), cx = t.plot.px + 8, cy = t.plot.py + 8;
            actCooldown = 0.38;
            let res;
            if (inf.empty) {
                res = FC.Farming.plant(id, FC.state.selectedSeed);
                if (res.ok) { P.act(); FC.UI.sfx("plant"); burst(cx, cy + 2, ["#a06c3f", "#c9a269", "#6cc767"], 8, 24); FC.UI.floatText("¡Sembrado!", "", { x: cx, y: cy - 14 }); }
            } else if (inf.ready) {
                res = FC.Farming.harvest(id);
                if (res.ok) { P.act(); FC.UI.sfx("harvest"); burst(cx, cy, ["#fff3b0", "#f5d04c", "#ffffff", inf.def.id === "tomato" ? "#d9453a" : "#f08a24"], 16, 44); FC.UI.floatText(res.msg, "good", { x: cx, y: cy - 14 }); }
            } else {
                res = FC.Farming.water(id);
                if (res.ok) { P.act(); FC.UI.sfx("water"); drops(cx, cy); FC.UI.floatText("¡Regada!", "water", { x: cx, y: cy - 14 }); }
            }
            if (!res.ok) { FC.UI.sfx("error"); FC.UI.toast(res.msg, "seed"); }
            return;
        }
        if (t.prop && t.prop.action) { FC.UI.sfx("click"); t.prop.action(); return; }
        FC.UI.sfx("click");
        if (t.kind === "door") FC.UI.openPanel("character");
        else if (t.kind === "board") FC.UI.openPanel("missions");
        else if (t.kind === "sign") FC.UI.openPanel("programming", { course: "python" });
        else if (t.kind === "stall") FC.UI.openPanel("market");
        else if (t.kind === "well") FC.UI.dialog({ icon: "drop", title: "El pozo de consejos", body: TIPS[(Math.random() * TIPS.length) | 0], button: "¡Gracias!" });
        else if (t.kind === "gate") {
            if (FC.state.flags.gateOpen) { FC.UI.toast("El portón ya está abierto.", "check"); return; }
            if (FC.levelFromXp(FC.state.xp) < 3) { FC.UI.sfx("error"); FC.UI.dialog({ icon: "lock", title: "Portón cerrado", body: "Este huerto es para agricultores con experiencia. Llega al nivel 3 cosechando, completando misiones y aprendiendo Python.", button: "Entendido" }); return; }
            FC.state.flags.gateOpen = true; FC.Store.save(FC.state);
            FC.UI.sfx("ok"); FC.UI.floatText("¡Portón abierto!", "good", { x: t.x, y: t.y });
            FC.event("gate", {});
        }
    }
    FC.Game = {
        toScreen, interact, burst,
        init() {
            canvas = $("#farm-canvas"); ctx = canvas.getContext("2d");
            resize(); window.addEventListener("resize", resize);
            window.addEventListener("orientationchange", () => setTimeout(resize, 200));
            FC.Map.init(); document.body.dataset.area = FC.Map.area;
            FC.Player.init(FC.state);
            FC.PetCompanion.init(FC.Player);
            updateCamera(true);
            bindInput();
            requestAnimationFrame(loop);
        },
        resetToStart() {
            FC.Map.load(FC.state.area || "farm"); document.body.dataset.area = FC.Map.area;
            FC.Player.init(FC.state); FC.PetCompanion.init(FC.Player); updateCamera(true); particles = [];
            Object.keys(inZone).forEach(k => delete inZone[k]);
        },
        // Cambia de área con un fundido a negro.
        travel(id) {
            if (traveling || !FC.Map.builders[id]) return;
            traveling = true; FC.UI.transitioning = true;
            const from = FC.Map.area, fade = $("#fade");
            fade.classList.add("on");
            setTimeout(() => {
                FC.Map.load(id);
                const sp = id === "farm" ? FC.Areas.backSpawn(from) : FC.Map.builders[id].spawn;
                const P = FC.Player; P.x = sp.x; P.y = sp.y; P.dir = sp.dir || "down"; P.actT = -1; P.moving = false;
                FC.state.area = id; P.save();
                FC.PetCompanion.init(P); particles = []; updateCamera(true);
                Object.keys(inZone).forEach(k => delete inZone[k]);
                document.body.dataset.area = id;
                for (const k in keys) keys[k] = false; for (const k in vdir) vdir[k] = false;
                const first = id !== "farm" && !FC.state.flags.areasVisited[id];
                if (id !== "farm") FC.state.flags.areasVisited[id] = true;
                FC.Store.save(FC.state);
                fade.classList.remove("on");
                setTimeout(() => {
                    traveling = false; FC.UI.transitioning = false;
                    FC.UI.areaBanner(FC.Map.current.name);
                    FC.event("area", { id, first });
                }, 300);
            }, 320);
        },
        info() { return { scale, viewW, viewH, cam }; },
        // Para las pruebas automáticas
        _debug: { keys, vdir, findTarget }
    };

    /* ---------- Controles ---------- */
    function bindInput() {
        const MOVE = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };
        window.addEventListener("keydown", e => {
            const tag = (e.target && e.target.tagName) || "";
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
            const k = e.key.toLowerCase();
            if (FC.UI.blocking()) return;
            if (MOVE[k]) { e.preventDefault(); keys[MOVE[k]] = true; }
            else if (k === "shift") keys.run = true;
            else if (k === "e" || k === " " || k === "enter") { if (tag === "BUTTON" && (k === " " || k === "enter")) return; e.preventDefault(); if (!e.repeat) interact(); }
            else if (k >= "1" && k <= "3") FC.Inventory.select(FC.CROP_ORDER[Number(k) - 1]);
        });
        window.addEventListener("keyup", e => {
            const k = e.key.toLowerCase();
            if (MOVE[k]) keys[MOVE[k]] = false; if (k === "shift") keys.run = false;
        });
        window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; for (const k in vdir) vdir[k] = false; });
        // Controles táctiles
        document.querySelectorAll("#dpad [data-dir]").forEach(b => {
            const d = b.dataset.dir;
            const on = e => { e.preventDefault(); vdir[d] = true; b.classList.add("down"); try { b.setPointerCapture(e.pointerId); } catch (x) { /* nada */ } };
            const off = e => { e.preventDefault(); vdir[d] = false; b.classList.remove("down"); };
            b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("lostpointercapture", off);
            b.addEventListener("contextmenu", e => e.preventDefault());
        });
        const act = $("#btn-act");
        act.addEventListener("pointerdown", e => { e.preventDefault(); act.classList.add("down"); interact(); });
        ["pointerup", "pointercancel", "pointerleave"].forEach(ev => act.addEventListener(ev, () => act.classList.remove("down")));
        act.addEventListener("contextmenu", e => e.preventDefault());
        // Tocar el aviso también interactúa (cómodo en móvil)
        $("#prompt").addEventListener("pointerdown", e => { e.preventDefault(); interact(); });
    }

    /* ---------- Dibujo ---------- */
    function spriteOf(o) {
        const key = typeof o.sprite === "function" ? o.sprite() : o.sprite;
        const s = FC.Sprites.obj[key];
        return Array.isArray(s) ? s[o.variant || 0] : s;
    }
    function drawWorld() {
        const M = FC.Map, S = FC.Sprites;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = M.current.bg || "#3a6b2f"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = Math.round(cam.x), cy = Math.round(cam.y);
        ctx.setTransform(scale, 0, 0, scale, -cx * scale, -cy * scale);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(M.groundImg[Math.floor(time * 1.4) % 2], 0, 0);

        // Cultivos (van pegados al suelo)
        M.plots.forEach(p => {
            if (!FC.Farming.isUnlocked(p) && p.advanced) return;
            const inf = FC.Farming.info(p.id);
            if (inf.empty) return;
            if (inf.watered) { ctx.fillStyle = "rgba(30,15,5,.28)"; ctx.fillRect(p.px + 1, p.py + 1, 14, 14); }
            ctx.drawImage(S.crop[inf.crop][inf.stage], p.px, p.py);
            if (inf.ready) { const b = Math.sin(time * 5 + p.px) * 1.5; ctx.fillStyle = "#fff3b0"; ctx.fillRect(p.px + 12, Math.round(p.py - 2 + b), 2, 2); ctx.fillRect(p.px + 11, Math.round(p.py - 1 + b), 4, 0.01); }
        });
        // Marco de selección
        if (target && target.kind === "plot") {
            const p = target.plot, pulse = (Math.floor(time * 4) % 2) ? 0 : 1;
            ctx.strokeStyle = "#fffbe0"; ctx.lineWidth = 1;
            ctx.strokeRect(p.px + 0.5 - pulse * 0.5, p.py + 0.5 - pulse * 0.5, 15 + pulse, 15 + pulse);
        }
        // Objetos y personajes ordenados por altura (los de abajo se dibujan encima)
        const list = [];
        M.objects.forEach(o => {
            let w, h;
            if (o.draw) { w = o.w; h = o.h; } else { const s = spriteOf(o); if (!s) return; w = s.width; h = s.height; }
            if (o.x > cam.x + viewW + 4 || o.x + w < cam.x - 4 || o.y > cam.y + viewH + 4 || o.y + h < cam.y - 4) return;
            list.push(o);
        });
        list.push({ sortY: FC.Player.y, draw: () => FC.Player.draw(ctx) });
        list.push({ sortY: FC.PetCompanion.y(), draw: () => FC.PetCompanion.draw(ctx) });
        list.sort((a, b) => a.sortY - b.sortY);
        list.forEach(o => { if (o.draw) o.draw(ctx, time); else ctx.drawImage(spriteOf(o), o.x, o.y); });
        drawParticles();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    function updatePrompt() {
        const p = $("#prompt");
        if (FC.UI.blocking() || !target) { p.classList.add("hidden"); return; }
        const label = labelFor(target);
        const k = $("#prompt-key"), txt = $("#prompt-text");
        if (txt.textContent !== label) txt.textContent = label;
        const touch = window.matchMedia("(pointer: coarse)").matches;
        k.textContent = touch ? "A" : "E";
        const s = toScreen(target.x, target.kind === "plot" ? target.y - 6 : target.y);
        p.style.left = Math.max(70, Math.min(window.innerWidth - 70, s.x)) + "px";
        p.style.top = Math.max(70, s.y) + "px";
        p.classList.remove("hidden");
    }

    /* ---------- Bucle principal ---------- */
    function loop(now) {
        const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; time += dt;
        const blocked = FC.UI.blocking();
        let dx = 0, dy = 0;
        if (!blocked) {
            if (keys.left || vdir.left) dx -= 1; if (keys.right || vdir.right) dx += 1;
            if (keys.up || vdir.up) dy -= 1; if (keys.down || vdir.down) dy += 1;
        }
        if (actCooldown > 0) actCooldown -= dt;
        FC.Player.update(dt, dx, dy, keys.run);
        FC.PetCompanion.update(dt, FC.Player);
        updateParticles(dt);
        updateCamera(false);
        target = blocked ? null : findTarget();
        // Zonas
        Object.keys(FC.Map.zones).forEach(id => {
            const z = FC.Map.zones[id], inside = FC.Player.x >= z.x && FC.Player.x <= z.x + z.w && FC.Player.y >= z.y && FC.Player.y <= z.y + z.h;
            if (inside && !inZone[id]) { if (id === "field") FC.state.flags.visitedField = true; FC.event("zone", { id }); }
            inZone[id] = inside;
        });
        // Salidas a otras áreas
        if (!blocked && !traveling) {
            const P = FC.Player, ex = FC.Map.exits.find(e => !(e.locked && e.locked()) && P.x >= e.rect.x && P.x <= e.rect.x + e.rect.w && P.y >= e.rect.y && P.y <= e.rect.y + e.rect.h);
            if (ex) FC.Game.travel(ex.to);
        }
        saveT += dt; if (saveT > 4) { saveT = 0; FC.Player.save(); FC.Store.save(FC.state); }
        if (!document.body.classList.contains("panel-open")) drawWorld();
        updatePrompt();
        requestAnimationFrame(loop);
    }
})();
