/* ==========================================================
   panels.js — Pantallas independientes del menú:
   Mascotas, Misiones, Inventario, Experiencia y logros,
   Mercado, Ayuda, Cerrar sesión (cambiar de jugador) y Bienvenida.
   (Personaje, Programación y Comunidad están en sus propios archivos.)
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const el = (t, c, h) => FC.el(t, c, h);
    const esc = FC.esc;
    const ico = (n, s) => FC.Sprites.iconHtml(n, s);
    FC.Panels = FC.Panels || {};

    const rewardChips = r => FC.rewardLines(r).map(l => `<span class="chip gold">${ico(l.icon, 16)}${esc(l.text)}</span>`).join("");
    const petImg = id => FC.Sprites.pet(id)[0].toDataURL();

    /* ---------------- MASCOTAS ---------------- */
    FC.Panels.pets = {
        title: "Mis mascotas", icon: "paw",
        render(body) {
            const st = FC.state;
            body.innerHTML = `<p class="intro">No tienes que aprender solo. Tus compañeros te siguen por la granja. Elige cuál quieres a tu lado y descubre cómo desbloquear a los demás.</p><div class="grid c3" id="pet-grid"></div>`;
            const grid = body.querySelector("#pet-grid");
            FC.PET_ORDER.forEach(id => {
                const d = FC.PETS[id], unlocked = FC.Pets.isUnlocked(id), active = st.pets.active === id;
                const card = el("div", "card" + (unlocked ? "" : " dark"));
                card.style.textAlign = "center";
                card.innerHTML = `<div style="min-height:120px;display:grid;place-items:center;background:${unlocked ? "#8bd450" : "#2b1d14"};box-shadow:0 0 0 3px var(--ink);margin-bottom:12px">
                    <img alt="${esc(d.name)}" src="${petImg(id)}" style="width:144px;image-rendering:pixelated;${unlocked ? "" : "filter:brightness(0) opacity(.55)"}"></div>
                    <h3 style="font:400 13px/1.5 var(--font-px);margin:6px 0 2px">${esc(d.name)}</h3><div style="font-weight:800;margin-bottom:8px;opacity:.75">${esc(d.kind)}</div>
                    <p style="margin:0 0 10px;font-size:15px;line-height:1.45">${esc(d.desc)}</p>`;
                const status = el("div");
                if (unlocked) {
                    const b = el("button", "pxbtn" + (active ? " gold" : " primary")); b.type = "button";
                    b.textContent = active ? "✓ Te acompaña" : "Elegir compañero"; b.disabled = active;
                    b.addEventListener("click", () => { FC.Pets.select(id); FC.UI.sfx("ok"); FC.UI.toast(`${d.name} te acompañará.`, "paw"); FC.UI.refreshPanel(); });
                    status.appendChild(b);
                } else status.innerHTML = `<span class="chip gray">${ico("lock", 16)}${esc(d.hint)}</span>`;
                card.appendChild(status); grid.appendChild(card);
            });
        }
    };

    /* ---------------- MISIONES ---------------- */
    FC.Panels.missions = {
        title: "Misiones", icon: "scroll",
        render(body) {
            const st = FC.state, c = FC.Missions.counts();
            body.innerHTML = `<p class="intro">Cada misión tiene un objetivo claro. Al completarla recibes experiencia y recompensas. Las nuevas misiones se desbloquean al terminar otras.</p>
                <div class="row" style="margin:0 4px 6px"><span class="chip green">${ico("check", 16)}${c.done} de ${c.total} completadas</span></div>`;
            [["active", "En curso"], ["locked", "Por desbloquear"], ["done", "Completadas"]].forEach(([status, label]) => {
                const defs = FC.MISSIONS.filter(d => (st.missions[d.id] || { status: "locked" }).status === status);
                if (!defs.length) return;
                body.appendChild(el("h2", "sect", label));
                const grid = el("div", "grid c2");
                defs.forEach(d => {
                    const p = FC.Missions.progress(d), pct = Math.round(p / d.target * 100);
                    const card = el("div", "card mission " + status);
                    let cond = "";
                    if (status === "locked") {
                        const names = (d.requires || []).map(r => FC.MISSIONS.find(x => x.id === r).name);
                        cond = `<div class="muted" style="font-weight:800">${ico("lock", 16)} Se desbloquea al completar: ${esc(names.join(", ") || "—")}</div>`;
                    }
                    card.innerHTML = `<div>${ico(status === "done" ? "check" : d.icon, 44)}</div><div>
                        <h3>${esc(d.name)}</h3><p>${esc(d.desc)}</p>
                        <div class="muted" style="font-weight:800;margin-bottom:4px">Objetivo: ${esc(d.goal)}${status === "active" ? ` (${p}/${d.target})` : ""}</div>
                        ${status === "active" ? `<div class="bar"><i style="width:${pct}%"></i></div>` : ""}
                        ${cond}<div style="margin-top:8px">${rewardChips(d.reward)}</div></div>`;
                    grid.appendChild(card);
                });
                body.appendChild(grid);
            });
        }
    };

    /* ---------------- INVENTARIO ---------------- */
    FC.Panels.inventory = {
        title: "Inventario", icon: "bag",
        render(body) {
            const st = FC.state, inv = st.inv;
            body.innerHTML = `<div class="row" style="margin:0 4px"><span class="chip gold" style="font-size:16px;padding:6px 12px">${ico("coin", 20)}${st.coins} monedas</span></div>`;
            const section = (title, items) => {
                body.appendChild(el("h2", "sect", title));
                const g = el("div", "slots"); items.forEach(i => g.appendChild(i)); body.appendChild(g);
            };
            const mkItem = (icon, name, count, extra, onClick) => {
                const i = el(onClick ? "button" : "div", "item" + (count === 0 ? " empty" : ""));
                if (onClick) { i.type = "button"; i.style.border = "0"; i.addEventListener("click", onClick); }
                i.innerHTML = `${ico(icon, 40)}<b>${esc(name)}</b><span>${extra || (count !== null ? "x" + count : "")}</span>`; return i;
            };
            section("Semillas (toca una para elegirla)", FC.CROP_ORDER.map(id => {
                const c = FC.CROPS[id], n = inv.seeds[id] || 0;
                const it = mkItem("seed", c.name, n, (st.selectedSeed === id ? "✓ elegida · x" : "x") + n, () => { FC.Inventory.select(id); FC.UI.sfx("click"); FC.UI.refreshPanel(); });
                if (st.selectedSeed === id) it.style.boxShadow = "var(--frame), 0 0 0 4px var(--gold)";
                return it;
            }));
            section("Cosechas", FC.CROP_ORDER.map(id => mkItem(FC.CROPS[id].icon, FC.CROPS[id].name, inv.crops[id] || 0)));
            section("Herramientas", Object.keys(FC.TOOLS).map(id => mkItem(FC.TOOLS[id].icon, FC.TOOLS[id].name, inv.tools[id] || 0, "Siempre contigo")));
            const sp = Object.keys(FC.SPECIALS).filter(id => inv.special[id]);
            body.appendChild(el("h2", "sect", "Objetos especiales"));
            if (sp.length) { const g = el("div", "slots"); sp.forEach(id => g.appendChild(mkItem(FC.SPECIALS[id].icon, FC.SPECIALS[id].name, inv.special[id]))); body.appendChild(g); }
            else body.appendChild(el("p", "intro", "Todavía no tienes objetos especiales. Se consiguen con misiones importantes y terminando el Huerto de Python."));
        }
    };

    /* ---------------- EXPERIENCIA Y LOGROS ---------------- */
    FC.Panels.progress = {
        title: "Experiencia y logros", icon: "trophy",
        render(body) {
            const st = FC.state, L = FC.levelFromXp(st.xp), base = FC.xpForLevel(L), next = FC.xpForLevel(L + 1), max = L >= FC.MAX_LEVEL;
            const pct = max ? 100 : Math.round((st.xp - base) / (next - base) * 100);
            body.innerHTML = `<div class="card"><div class="row"><div>${ico("star", 56)}</div><div style="flex:1;min-width:200px">
                <div class="big-number">Nivel ${L}</div>
                <div class="muted" style="font-weight:800;margin:6px 0">${st.xp} XP en total${max ? " · ¡Nivel máximo!" : ` · te faltan ${next - st.xp} XP para el nivel ${L + 1}`}</div>
                <div class="bar gold"><i style="width:${pct}%"></i></div></div></div></div>
                <h2 class="sect">Tu historia en la granja</h2>
                <div class="grid auto" id="stat-grid"></div>
                <h2 class="sect">Logros (${Object.keys(st.achievements).length}/${FC.ACHIEVEMENTS.length})</h2><div class="grid c2" id="ach-grid"></div>`;
            const stats = [["seed", st.stats.planted, "Cultivos sembrados"], ["carrot", st.stats.harvested, "Cultivos cosechados"], ["coin", st.stats.coinsEarned, "Monedas ganadas"], ["book", st.stats.lessonsDone, "Lecciones completadas"], ["snake", st.stats.exercisesDone, "Ejercicios resueltos"], ["scroll", FC.Missions.counts().done, "Misiones completadas"]];
            const sg = body.querySelector("#stat-grid");
            stats.forEach(s => sg.appendChild(el("div", "card stat", `${ico(s[0], 32)}<div class="big-number" style="margin-top:6px">${s[1]}</div><small>${s[2]}</small>`)));
            const ag = body.querySelector("#ach-grid");
            FC.ACHIEVEMENTS.forEach(a => {
                const got = st.achievements[a.id];
                ag.appendChild(el("div", "card ach" + (got ? "" : " locked"), `<div>${ico(got ? a.icon : "lock", 40)}</div><div><h3>${esc(a.name)}</h3><p>${esc(a.desc)}</p>${got ? `<span class="chip green">${ico("check", 14)}Conseguido</span>` : ""}</div>`));
            });
        }
    };

    /* ---------------- MERCADO ---------------- */
    let marketTab = "buy";
    FC.Panels.market = {
        title: "Mercado", icon: "coin",
        render(body) {
            const st = FC.state;
            body.innerHTML = `<div class="row" style="margin:0 4px 6px"><span class="chip gold" style="font-size:16px;padding:6px 12px">${ico("coin", 20)}<span>${st.coins}</span> monedas</span><span class="spacer"></span>
                <button class="pxbtn ${marketTab === "buy" ? "primary" : ""}" data-t="buy" type="button">Comprar semillas</button>
                <button class="pxbtn ${marketTab === "sell" ? "primary" : ""}" data-t="sell" type="button">Vender cosechas</button></div>
                <p class="intro">${marketTab === "buy" ? "Compra semillas para sembrar más parcelas. Algunas se desbloquean al subir de nivel." : "Vende lo que cosechaste para ganar monedas."}</p><div class="grid" id="m-list"></div>`;
            body.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { marketTab = b.dataset.t; FC.UI.sfx("click"); FC.UI.refreshPanel(); }));
            const list = body.querySelector("#m-list");
            const done = res => { FC.UI.sfx(res.ok ? "coin" : "error"); FC.UI.toast(res.msg, res.ok ? "coin" : "lock"); FC.UI.refreshPanel(); };
            FC.CROP_ORDER.forEach(id => {
                const c = FC.CROPS[id], card = el("div", "card shop-row");
                if (marketTab === "buy") {
                    const ok = FC.Inventory.canBuy(id);
                    card.innerHTML = `<div>${ico(ok ? c.icon : "lock", 44)}</div><div><h3>Semillas de ${esc(c.name.toLowerCase())}</h3><p>${ok ? `Crecen en ${c.growSec} s · Precio: ${c.buy} monedas · Tienes ${FC.Inventory.seeds(id)}` : `Se desbloquean en el nivel ${c.minLevel}`}</p></div><div class="shop-actions"></div>`;
                    const a = card.querySelector(".shop-actions");
                    [1, 5].forEach(q => { const b = el("button", "pxbtn small"); b.type = "button"; b.textContent = `Comprar ${q} (${c.buy * q})`; b.disabled = !ok || st.coins < c.buy * q; b.addEventListener("click", () => done(FC.Inventory.buySeed(id, q))); a.appendChild(b); });
                } else {
                    const n = FC.Inventory.crops(id);
                    card.innerHTML = `<div>${ico(c.icon, 44)}</div><div><h3>${esc(c.name)}</h3><p>Tienes ${n} · Se paga a ${c.sell} monedas cada una</p></div><div class="shop-actions"></div>`;
                    const a = card.querySelector(".shop-actions");
                    const b1 = el("button", "pxbtn small"); b1.type = "button"; b1.textContent = "Vender 1"; b1.disabled = n < 1; b1.addEventListener("click", () => done(FC.Inventory.sellCrop(id, 1))); a.appendChild(b1);
                    const b2 = el("button", "pxbtn small gold"); b2.type = "button"; b2.textContent = `Vender todo (${c.sell * n})`; b2.disabled = n < 1; b2.addEventListener("click", () => done(FC.Inventory.sellCrop(id, n))); a.appendChild(b2);
                }
                list.appendChild(card);
            });
        }
    };

    /* ---------------- AYUDA Y CONTROLES ---------------- */
    FC.Panels.help = {
        title: "Ayuda y controles", icon: "help",
        render(body) {
            const st = FC.state;
            body.innerHTML = `<div class="grid c2">
                <div class="card"><h2 class="sect" style="margin-top:0">Moverte</h2>
                    <p><span class="chip">W A S D</span> o <span class="chip">← ↑ ↓ →</span> para caminar. Mantén <span class="chip">Shift</span> para correr.</p>
                    <p><b>En el celular:</b> usa la cruz de la izquierda para moverte y el botón <span class="chip green">A</span> para actuar.</p></div>
                <div class="card"><h2 class="sect" style="margin-top:0">Interactuar</h2>
                    <p>Acércate a un objeto y pulsa <span class="chip">E</span>, <span class="chip">Espacio</span> o <span class="chip">Enter</span>. Aparecerá un letrero que te dice qué puedes hacer.</p>
                    <p>Elige tu semilla con <span class="chip">1</span> <span class="chip">2</span> <span class="chip">3</span> o tocando la barra de semillas.</p></div>
                <div class="card"><h2 class="sect" style="margin-top:0">Cultivar</h2>
                    <p><b>1.</b> Párate junto a una parcela de tierra y pulsa E para sembrar.<br><b>2.</b> Vuelve a pulsar E para regar: ¡crece más rápido y da el doble!<br><b>3.</b> Cuando brille, pulsa E para cosechar.<br><b>4.</b> Vende en el mercado y compra más semillas.</p>
                    <p class="muted">Las plantas siguen creciendo aunque cierres el juego.</p></div>
                <div class="card"><h2 class="sect" style="margin-top:0">Aprender Python</h2>
                    <p>Lee el letrero del Huerto de Python (o abre «Programación» en el menú). Cada lección te explica una idea, te deja probar código y te pide resolver pequeños retos.</p>
                    <p>¡Equivocarse es normal! Recibirás pistas y nadie te castiga por probar.</p></div>
                <div class="card"><h2 class="sect" style="margin-top:0">Menú</h2>
                    <p>Pulsa el botón de las tres líneas arriba a la izquierda. Con <span class="chip">Esc</span> cierras el menú y las pantallas. Tu progreso se conserva al volver a la granja.</p></div>
                <div class="card"><h2 class="sect" style="margin-top:0">Comunidad</h2>
                    <p>La comunidad con perfiles y publicaciones necesita un servidor y todavía no está activa. Mira la pantalla «Comunidad» para saber qué llegará.</p></div></div>
                <h2 class="sect">Opciones</h2>
                <div class="card row"><span style="font-weight:800">Sonido del juego</span><span class="spacer"></span><button id="snd" class="pxbtn" type="button"></button></div>
                <div class="card"><b>¿Dónde se guarda mi progreso?</b><p style="margin:6px 0 0">Ahora mismo, en este navegador y en este dispositivo (sin contraseña). Si borras los datos del navegador, se pierde. Las cuentas en línea llegarán más adelante.</p></div>`;
            const snd = body.querySelector("#snd");
            const paint = () => { snd.textContent = st.settings.sound === false ? "Desactivado" : "Activado"; snd.className = "pxbtn " + (st.settings.sound === false ? "" : "primary"); };
            paint();
            snd.addEventListener("click", () => { st.settings.sound = st.settings.sound === false; FC.Store.save(st); paint(); FC.UI.sfx("ok"); });
        }
    };

    /* ---------------- CERRAR SESIÓN / CAMBIAR DE JUGADOR ---------------- */
    function validName(n) {
        n = (n || "").trim().replace(/\s+/g, " ");
        if (n.length < 2) return { ok: false, msg: "El nombre debe tener al menos 2 letras." };
        if (n.length > 16) return { ok: false, msg: "Máximo 16 caracteres." };
        if (!/^[\p{L}\p{N} _-]+$/u.test(n)) return { ok: false, msg: "Usa solo letras, números, espacios, guion o guion bajo." };
        return { ok: true, name: n };
    }
    FC.validName = validName;
    function switchTo(id) {
        FC.Player.save(); FC.Store.saveNow(FC.state);
        FC.Store.setActive(id);
        FC.state = FC.Store.loadProfile(id);
        FC.Sprites.charSheet(FC.state.avatar);
        FC.Game.resetToStart(); FC.Missions.refresh(); FC.Pets.check(); FC.UI.updateHud();
        FC.UI.closePanel();
        FC.UI.toast(`¡Hola, ${FC.state.avatar.name}!`, "heart");
        if (!FC.state.flags.welcomed) FC.Welcome.show();
    }
    FC.switchTo = switchTo;
    FC.Panels.switch = {
        title: "Cerrar sesión", icon: "door",
        render(body) {
            const profiles = FC.Store.listProfiles(), active = FC.state.id;
            body.innerHTML = `<div class="card"><b>Modo local (sin cuentas todavía)</b><p style="margin:6px 0 0">Por ahora Farm Code guarda a cada jugador en este navegador y no usa correo ni contraseña. Cuando exista el servidor, aquí podrás cerrar la sesión de tu cuenta real. Mientras tanto puedes cambiar de jugador o crear otro.</p></div>
                <h2 class="sect">Jugadores en este dispositivo</h2><div class="grid c2" id="pl-list"></div>
                <h2 class="sect">Nuevo jugador</h2><div class="card"><div class="field"><label for="np-name">Nombre del nuevo jugador</label><input id="np-name" maxlength="16" autocomplete="off" placeholder="Ejemplo: Luna"><div class="err" id="np-err" aria-live="polite"></div></div><button id="np-go" class="pxbtn primary" type="button">Crear y jugar</button></div>`;
            const list = body.querySelector("#pl-list");
            profiles.sort((a, b) => b.updated - a.updated).forEach(p => {
                const card = el("div", "card row");
                card.innerHTML = `<div style="flex:1;min-width:120px"><b style="font:400 12px var(--font-px)">${esc(p.username)}</b><div class="muted" style="font-weight:700">Nivel ${p.level || 1}${p.id === active ? " · jugando ahora" : ""}</div></div>`;
                if (p.id !== active) {
                    const go = el("button", "pxbtn small primary"); go.type = "button"; go.textContent = "Jugar"; go.addEventListener("click", () => switchTo(p.id)); card.appendChild(go);
                }
                const del = el("button", "pxbtn small danger"); del.type = "button"; del.textContent = "Borrar";
                del.addEventListener("click", () => FC.UI.confirm("¿Borrar este jugador?", `Se perderá todo el progreso de ${p.username}. No se puede deshacer.`, "Sí, borrar", () => {
                    const wasActive = p.id === active;
                    FC.Store.deleteProfile(p.id);
                    if (wasActive) {
                        const rest = FC.Store.listProfiles();
                        if (rest.length) switchTo(rest[0].id);
                        else { const n = FC.Store.createProfile("Granjero"); switchTo(n.id); }
                    } else FC.UI.refreshPanel();
                }, true));
                card.appendChild(del); list.appendChild(card);
            });
            const go = () => {
                const v = validName(body.querySelector("#np-name").value);
                if (!v.ok) { body.querySelector("#np-err").textContent = v.msg; return; }
                const st = FC.Store.createProfile(v.name); st.avatar.name = v.name; st.flags.welcomed = true; FC.Store.saveNow(st);
                switchTo(st.id);
            };
            body.querySelector("#np-go").addEventListener("click", go);
            body.querySelector("#np-name").addEventListener("keydown", e => { if (e.key === "Enter") go(); });
        }
    };

    /* ---------------- BIENVENIDA (primera vez) ---------------- */
    FC.Welcome = {
        show() {
            const st = FC.state;
            const node = el("div", "", `<div class="field"><label for="w-name">¿Cómo te llamas, granjero?</label><input id="w-name" maxlength="16" autocomplete="off" value="${esc(st.avatar.name === "Granjero" ? "" : st.avatar.name)}" placeholder="Escribe tu nombre"><div class="err" id="w-err" aria-live="polite"></div></div>`);
            const input = node.querySelector("#w-name");
            const finish = () => {
                const v = validName(input.value || "Granjero");
                if (!v.ok) { node.querySelector("#w-err").textContent = v.msg; return false; }
                st.username = v.name; st.avatar.name = v.name; st.flags.welcomed = true;
                FC.Store.saveNow(st); FC.UI.updateHud();
                setTimeout(() => FC.UI.dialog({
                    icon: "snake", title: "¡Bienvenido al Huerto de Python!",
                    body: "Aquí aprenderás a programar cultivando tu granja.\n\nMuévete con W A S D, acércate al letrero de madera junto al camino y pulsa E para empezar tu primera lección. ¡Tu perrito Code te acompañará!",
                    button: "¡A la granja!"
                }), 150);
                FC.Missions.refresh();
                return true;
            };
            input.addEventListener("keydown", e => { if (e.key === "Enter") { if (finish()) FC.UI.closeDialog(); } });
            FC.UI.dialog({ icon: "farm", title: "¡Bienvenido a Farm Code!", body: "Una granja donde aprendes a programar jugando.", node, buttons: [{ text: "Empezar", primary: true, onClick: finish }], dismissible: false });
        }
    };
})();
