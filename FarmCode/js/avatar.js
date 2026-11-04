/* ==========================================================
   avatar.js — Pantalla «Mi personaje»: personalización
   Los cambios se ven en el mapa y se guardan en tu perfil.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const el = (t, c, h) => FC.el(t, c, h), esc = FC.esc;
    let anim = null;

    const GROUPS = [
        ["skin", "Tono de piel", "swatch"], ["hairStyle", "Peinado", "text"], ["hairColor", "Color de cabello", "swatch"],
        ["shirt", "Ropa (camisa)", "swatch"], ["pants", "Pantalón", "swatch"], ["hat", "Sombrero", "text"], ["accessory", "Accesorios", "text"]
    ];

    FC.Panels.character = {
        title: "Mi personaje", icon: "hero",
        onClose() { if (anim) { clearInterval(anim); anim = null; } },
        render(body) {
            const st = FC.state, level = FC.levelFromXp(st.xp);
            const draft = { ...st.avatar };
            let dir = "down", frame = 0, walking = true;
            body.innerHTML = `<p class="intro">Elige cómo se ve tu personaje. Lo que cambies aquí aparece en la granja. Algunas opciones se desbloquean al subir de nivel.</p>
              <div class="avatar-layout">
                <div class="card avatar-stage">
                    <canvas id="av-canvas" width="160" height="224" aria-label="Vista previa de tu personaje"></canvas>
                    <div class="row" style="justify-content:center">
                        <button class="pxbtn small" id="av-left" type="button" aria-label="Girar a la izquierda">◀</button>
                        <button class="pxbtn small" id="av-walk" type="button" aria-pressed="true">Caminar</button>
                        <button class="pxbtn small" id="av-right" type="button" aria-label="Girar a la derecha">▶</button>
                    </div>
                    <div class="field" style="margin-top:12px"><label for="av-name">Nombre del personaje</label><input id="av-name" maxlength="16" autocomplete="off"><div class="err" id="av-err" aria-live="polite"></div></div>
                </div>
                <div class="avatar-options" id="av-options"></div>
              </div>
              <div class="row" style="justify-content:center;margin-top:18px"><button class="pxbtn" id="av-reset" type="button">Deshacer cambios</button><button class="pxbtn primary" id="av-save" type="button">Guardar personaje</button></div>`;
            const canvas = body.querySelector("#av-canvas"), cx = canvas.getContext("2d"); cx.imageSmoothingEnabled = false;
            const nameInput = body.querySelector("#av-name"); nameInput.value = st.avatar.name;
            const dirs = ["down", "left", "up", "right"];
            function draw() {
                const sheet = FC.Sprites.charSheet(draft), C = FC.Sprites.CHAR, row = { down: 0, left: 1, right: 2, up: 3 }[dir];
                cx.clearRect(0, 0, 160, 224);
                cx.fillStyle = "#8bd450"; cx.fillRect(0, 0, 160, 224);
                cx.fillStyle = "#79c24f"; for (let i = 0; i < 18; i++) cx.fillRect((i * 53) % 150, (i * 37) % 215, 8, 8);
                cx.fillStyle = "rgba(0,0,0,.2)"; cx.fillRect(40, 196, 80, 12);
                cx.drawImage(sheet, (walking ? frame : 0) * C.w, row * C.h, C.w, C.h, 0, 0, 160, 224);
            }
            if (anim) clearInterval(anim);
            anim = setInterval(() => { frame = (frame + 1) % 4; if (walking) draw(); }, 140);
            const opts = body.querySelector("#av-options");
            function renderOptions() {
                opts.innerHTML = "";
                GROUPS.forEach(([key, label, kind]) => {
                    const box = el("div", "card"); box.appendChild(el("h2", "sect", label)); box.lastChild.style.margin = "0 0 10px";
                    const row = el("div", "opt-row");
                    FC.AVATAR_OPTIONS[key].forEach(o => {
                        const locked = (o.minLevel || 1) > level;
                        const b = el("button", (kind === "swatch" ? "swatch" : "pxbtn small opt") + (draft[key] === o.v ? " sel" : "") + (locked ? " locked" : "")); b.type = "button";
                        b.setAttribute("aria-pressed", String(draft[key] === o.v));
                        b.setAttribute("aria-label", o.n + (locked ? ` (se desbloquea en el nivel ${o.minLevel})` : ""));
                        b.title = locked ? `Nivel ${o.minLevel}` : o.n;
                        if (kind === "swatch") { b.style.background = o.v; if (locked) b.innerHTML = FC.Sprites.iconHtml("lock", 16); }
                        else b.innerHTML = (locked ? FC.Sprites.iconHtml("lock", 14) + " " : "") + esc(o.n) + (locked ? ` · Nv ${o.minLevel}` : "");
                        b.addEventListener("click", () => {
                            if (locked) { FC.UI.sfx("error"); FC.UI.toast(`«${o.n}» se desbloquea en el nivel ${o.minLevel}.`, "lock"); return; }
                            draft[key] = o.v; FC.UI.sfx("click"); renderOptions(); draw();
                        });
                        row.appendChild(b);
                    });
                    box.appendChild(row); opts.appendChild(box);
                });
            }
            renderOptions(); draw();
            body.querySelector("#av-left").addEventListener("click", () => { dir = dirs[(dirs.indexOf(dir) + 1) % 4]; draw(); });
            body.querySelector("#av-right").addEventListener("click", () => { dir = dirs[(dirs.indexOf(dir) + 3) % 4]; draw(); });
            const wb = body.querySelector("#av-walk");
            wb.addEventListener("click", () => { walking = !walking; wb.setAttribute("aria-pressed", String(walking)); wb.textContent = walking ? "Caminar" : "Quieto"; draw(); });
            body.querySelector("#av-reset").addEventListener("click", () => { Object.assign(draft, st.avatar); nameInput.value = st.avatar.name; renderOptions(); draw(); FC.UI.toast("Cambios deshechos.", "check"); });
            body.querySelector("#av-save").addEventListener("click", () => {
                const v = FC.validName(nameInput.value);
                if (!v.ok) { body.querySelector("#av-err").textContent = v.msg; return; }
                body.querySelector("#av-err").textContent = "";
                // Comprueba otra vez en el momento de guardar que las opciones estén desbloqueadas.
                for (const [key] of GROUPS) {
                    const o = FC.AVATAR_OPTIONS[key].find(x => x.v === draft[key]);
                    if (!o || (o.minLevel || 1) > FC.levelFromXp(st.xp)) { FC.UI.toast("Alguna opción todavía está bloqueada.", "lock"); return; }
                }
                Object.assign(st.avatar, draft, { name: v.name });
                st.username = v.name;
                FC.Store.saveNow(st);
                FC.Sprites.charSheet(st.avatar);
                st.stats.avatarSaved++;
                FC.UI.sfx("ok"); FC.UI.toast("¡Personaje guardado!", "hero");
                FC.UI.refreshMenu();
                FC.event("avatar", {});
            });
        }
    };
})();
