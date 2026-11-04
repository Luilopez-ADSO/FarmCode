/* ==========================================================
   ui.js — Ventanas del juego, avisos, menú hamburguesa, paneles,
   sonidos y la información básica en pantalla (HUD).
   No se usan alert() ni confirm() del navegador.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const $ = (s, r) => (r || document).querySelector(s);
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
    FC.$ = $; FC.el = el;
    // Escapa texto para usarlo dentro de HTML (evita inyección de código).
    FC.esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    /* ---------------- SONIDO (sintetizado, sin archivos) ---------------- */
    let audio = null;
    function ctx() {
        if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audio = false; } }
        if (audio && audio.state === "suspended") audio.resume();
        return audio;
    }
    function tone(freq, start, dur, type, vol) {
        const a = ctx(); if (!a) return;
        const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
        o.type = type || "square"; o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
    }
    const SFX = {
        click: () => tone(520, 0, 0.06),
        plant: () => { tone(220, 0, 0.08, "triangle", 0.08); tone(330, 0.07, 0.1, "triangle", 0.08); },
        water: () => { tone(700, 0, 0.05, "sine", 0.06); tone(520, 0.05, 0.05, "sine", 0.06); tone(420, 0.1, 0.08, "sine", 0.06); },
        harvest: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.12)),
        coin: () => { tone(988, 0, 0.07); tone(1319, 0.07, 0.18); },
        error: () => { tone(160, 0, 0.14, "sawtooth", 0.05); },
        level: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.2)),
        quest: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.22)),
        ok: () => { tone(660, 0, 0.08); tone(880, 0.08, 0.12); }
    };
    FC.UI = FC.UI || {};
    FC.UI.sfx = name => { if (FC.state && FC.state.settings && FC.state.settings.sound === false) return; try { if (SFX[name]) SFX[name](); } catch (e) { /* sin sonido */ } };

    /* ---------------- AVISOS PEQUEÑOS ---------------- */
    FC.UI.toast = function (msg, icon) {
        const box = $("#toasts"); if (!box) return;
        const t = el("div", "toast");
        t.innerHTML = (icon ? FC.Sprites.iconHtml(icon, 20) : "") + `<span>${FC.esc(msg)}</span>`;
        box.appendChild(t);
        while (box.children.length > 4) box.removeChild(box.firstChild);
        setTimeout(() => t.classList.add("out"), 2600);
        setTimeout(() => t.remove(), 3000);
    };
    // Texto que sube y se desvanece cerca del personaje.
    FC.UI.floatText = function (text, kind, worldPos) {
        const layer = $("#floaters"); if (!layer || !FC.Game) return;
        const p = FC.Game.toScreen(worldPos ? worldPos.x : FC.Player.x, worldPos ? worldPos.y : FC.Player.y - 30);
        const f = el("div", "floater " + (kind || ""), FC.esc(text));
        f.style.left = p.x + "px"; f.style.top = p.y + "px";
        layer.appendChild(f);
        setTimeout(() => f.remove(), 1400);
    };

    /* ---------------- VENTANAS (con cola) ---------------- */
    const queue = []; let current = null;
    function showNext() {
        if (current || !queue.length) return;
        const o = queue.shift(); current = o;
        const layer = $("#dialog-layer"), card = $("#dialog-card");
        card.innerHTML = "";
        card.className = "dialog-card " + (o.cls || "");
        card.setAttribute("aria-labelledby", "dialog-title");
        if (o.icon) card.appendChild(el("div", "dlg-icon", FC.Sprites.iconHtml(o.icon, 56)));
        const h = el("h2", "dlg-title"); h.id = "dialog-title"; h.textContent = o.title || ""; card.appendChild(h);
        if (o.subtitle) { const s = el("div", "dlg-sub"); s.textContent = o.subtitle; card.appendChild(s); }
        if (o.body) { const p = el("p", "dlg-body"); p.textContent = o.body; card.appendChild(p); }
        if (o.lines && o.lines.length) {
            const ul = el("ul", "dlg-lines");
            o.lines.forEach(l => { const li = el("li", "", FC.Sprites.iconHtml(l.icon, 22)); const sp = el("span"); sp.textContent = l.text; li.appendChild(sp); ul.appendChild(li); });
            card.appendChild(ul);
        }
        if (o.node) card.appendChild(o.node);
        const row = el("div", "dlg-buttons");
        (o.buttons || [{ text: o.button || "Continuar", primary: true }]).forEach((b, i) => {
            const btn = el("button", "pxbtn " + (b.primary ? "primary" : b.danger ? "danger" : "")); btn.type = "button"; btn.textContent = b.text;
            btn.addEventListener("click", () => {
                if (b.onClick && b.onClick(btn) === false) return;
                closeDialog(b);
            });
            row.appendChild(btn);
        });
        card.appendChild(row);
        layer.classList.remove("hidden"); layer.setAttribute("aria-hidden", "false");
        document.body.classList.add("dialog-open");
        const first = card.querySelector("input, button.primary, button");
        if (first) setTimeout(() => first.focus(), 30);
        FC.bus.emit("ui-block");
    }
    function closeDialog() {
        const o = current; current = null;
        const layer = $("#dialog-layer");
        layer.classList.add("hidden"); layer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("dialog-open");
        if (o && o.onClose) o.onClose();
        setTimeout(showNext, 120);
    }
    FC.UI.dialog = o => { queue.push(o); showNext(); };
    FC.UI.popup = o => { o.cls = (o.cls || "") + " popup"; FC.UI.dialog(o); };
    FC.UI.closeDialog = closeDialog;
    FC.UI.dialogOpen = () => !!current;
    FC.UI.confirm = (title, body, okText, onOk, danger) => FC.UI.dialog({
        icon: danger ? "lock" : "help", title, body,
        buttons: [{ text: "Cancelar" }, { text: okText || "Aceptar", primary: !danger, danger: !!danger, onClick: () => { onOk(); } }]
    });

    /* ---------------- MENÚ HAMBURGUESA ---------------- */
    const MENU = [
        { id: "farm", label: "Mi granja", icon: "farm" },
        { id: "character", label: "Mi personaje", icon: "hero" },
        { id: "pets", label: "Mis mascotas", icon: "paw" },
        { id: "missions", label: "Misiones", icon: "scroll" },
        { id: "programming", label: "Programación", icon: "book" },
        { id: "inventory", label: "Inventario", icon: "bag" },
        { id: "progress", label: "Experiencia y logros", icon: "trophy" },
        { id: "community", label: "Comunidad", icon: "people" },
        { id: "help", label: "Ayuda y controles", icon: "help" },
        { id: "switch", label: "Cerrar sesión", icon: "door" }
    ];
    let menuOpen = false, activePanel = "farm";
    FC.UI.setMenu = function (open) {
        menuOpen = open;
        document.body.classList.toggle("menu-open", open);
        const t = $("#menu-toggle");
        t.setAttribute("aria-expanded", String(open));
        t.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
        $("#side-menu").setAttribute("aria-hidden", String(!open));
        if (open) { FC.UI.refreshMenu(); const a = $("#side-menu .menu-link.active") || $("#side-menu .menu-link"); setTimeout(() => a && a.focus(), 60); }
        else if (document.activeElement && $("#side-menu").contains(document.activeElement)) t.focus();
    };
    FC.UI.refreshMenu = function () {
        const st = FC.state; if (!st) return;
        $("#menu-name").textContent = st.avatar.name || st.username;
        const L = FC.levelFromXp(st.xp);
        $("#menu-level").textContent = `Nivel ${L}`;
        const c = FC.Missions.counts();
        $("#menu-missions-count").textContent = `${c.done}/${c.total}`;
        $("#menu-avatar").src = FC.Sprites.charPreview(st.avatar, "down").toDataURL();
        document.querySelectorAll("#side-menu .menu-link").forEach(b => b.classList.toggle("active", b.dataset.panel === activePanel));
    };
    function buildMenu() {
        const nav = $("#menu-links");
        MENU.forEach(m => {
            const b = el("button", "menu-link", FC.Sprites.iconHtml(m.icon, 26) + `<span>${m.label}</span>`);
            b.type = "button"; b.dataset.panel = m.id;
            b.addEventListener("click", () => { FC.UI.sfx("click"); FC.UI.openPanel(m.id); });
            nav.appendChild(b);
        });
    }

    /* ---------------- PANELES (pantallas independientes) ---------------- */
    FC.Panels = FC.Panels || {};
    FC.UI.panelOpen = () => activePanel !== "farm";
    FC.UI.openPanel = function (name, opts) {
        FC.UI.setMenu(false);
        if (name === "farm" || !FC.Panels[name]) { FC.UI.closePanel(); return; }
        const P = FC.Panels[name], layer = $("#panel-layer"), body = $("#panel-body");
        activePanel = name;
        $("#panel-title").innerHTML = FC.Sprites.iconHtml(P.icon, 32) + `<span>${FC.esc(P.title)}</span>`;
        body.innerHTML = ""; body.scrollTop = 0;
        body.className = "panel-body panel-" + name;
        try { P.render(body, opts || {}); } catch (e) { console.error(e); body.textContent = "Ups, algo salió mal al abrir esta pantalla."; }
        layer.classList.remove("hidden"); layer.setAttribute("aria-hidden", "false");
        document.body.classList.add("panel-open");
        FC.UI.refreshMenu();
        setTimeout(() => $("#panel-close").focus({ preventScroll: true }), 40);
    };
    FC.UI.refreshPanel = function () { if (activePanel !== "farm") { const b = $("#panel-body"), sc = b.scrollTop; try { FC.Panels[activePanel].render(b, {}); } catch (e) { console.error(e); } b.scrollTop = sc; } };
    FC.UI.closePanel = function () {
        const layer = $("#panel-layer");
        const was = activePanel; activePanel = "farm";
        layer.classList.add("hidden"); layer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("panel-open");
        if (FC.Panels[was] && FC.Panels[was].onClose) FC.Panels[was].onClose();
        FC.UI.refreshMenu();
        const c = $("#farm-canvas"); if (c) c.focus({ preventScroll: true });
        FC.bus.emit("panel-closed");
    };
    FC.UI.blocking = () => menuOpen || activePanel !== "farm" || !!current || !!FC.UI.transitioning;
    // Rótulo grande con el nombre de la zona al llegar
    FC.UI.areaBanner = function (name) {
        const b = $("#area-banner"); if (!b) return;
        b.textContent = name; b.classList.remove("show"); void b.offsetWidth; b.classList.add("show");
    };

    /* ---------------- HUD ---------------- */
    FC.UI.updateHud = function () {
        const st = FC.state; if (!st) return;
        const L = FC.levelFromXp(st.xp), base = FC.xpForLevel(L), next = FC.xpForLevel(L + 1);
        const atMax = L >= FC.MAX_LEVEL;
        $("#hud-lv").textContent = L;
        $("#hud-xp").textContent = atMax ? "MAX" : `${st.xp - base}/${next - base}`;
        $("#hud-xpfill").style.width = (atMax ? 100 : ((st.xp - base) / (next - base)) * 100) + "%";
        $("#hud-coins").textContent = st.coins;
        // Barra de semillas
        const bar = $("#hotbar"); bar.innerHTML = "";
        FC.CROP_ORDER.forEach((id, i) => {
            const c = FC.CROPS[id], n = FC.Inventory.seeds(id);
            const locked = !FC.Inventory.canBuy(id) && n === 0;
            const b = el("button", "slot" + (st.selectedSeed === id ? " sel" : "") + (n === 0 ? " empty" : ""));
            b.type = "button"; b.title = `${c.name} (tecla ${i + 1})`;
            b.setAttribute("aria-label", `Semillas de ${c.name.toLowerCase()}: ${n}`);
            b.innerHTML = `<span class="key">${i + 1}</span>${FC.Sprites.iconHtml(locked ? "lock" : c.icon, 30)}<b class="count">${n}</b>`;
            b.addEventListener("click", e => { e.stopPropagation(); FC.UI.sfx("click"); FC.Inventory.select(id); });
            bar.appendChild(b);
        });
        FC.UI.refreshMenu();
    };

    FC.UI.init = function () {
        buildMenu();
        $("#menu-toggle").addEventListener("click", () => FC.UI.setMenu(!menuOpen));
        $("#menu-close").addEventListener("click", () => FC.UI.setMenu(false));
        $("#menu-backdrop").addEventListener("click", () => FC.UI.setMenu(false));
        $("#panel-close").addEventListener("click", () => { FC.UI.sfx("click"); FC.UI.closePanel(); });
        $("#brand-home").addEventListener("click", e => { e.preventDefault(); FC.UI.openPanel("farm"); });
        document.addEventListener("keydown", e => {
            if (e.key !== "Escape") return;
            if (current) { const b = $("#dialog-card .dlg-buttons button"); if (current.dismissible !== false && current.buttons && current.buttons.length > 1) closeDialog(); else if (current.dismissible !== false) closeDialog(); return; }
            if (menuOpen) { FC.UI.setMenu(false); return; }
            if (activePanel !== "farm") FC.UI.closePanel();
        });
        // Despierta el audio con el primer toque
        window.addEventListener("pointerdown", () => ctx(), { once: true });
        FC.bus.on("xp", FC.UI.updateHud); FC.bus.on("inventory", FC.UI.updateHud);
        FC.bus.on("level", FC.UI.updateHud); FC.bus.on("mission-done", FC.UI.refreshMenu);
    };
})();
