/* ==========================================================
   programming.js — Pantalla «Programación»:
   - FC.Check: comprueba los ejercicios EJECUTANDO el código
   - La ruta de lecciones y el reproductor de lecciones
   - El escenario visual (variables como cajas, plantas que se riegan…)
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const el = (t, c, h) => FC.el(t, c, h), esc = FC.esc, ico = (n, s) => FC.Sprites.iconHtml(n, s);

    /* =====================================================
       1. COMPROBADOR
       ===================================================== */
    const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
    const outLines = s => { const l = String(s).replace(/\r/g, "").split("\n").map(norm); while (l.length && l[l.length - 1] === "") l.pop(); return l; };
    const sameLines = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
    // Quita comentarios y contenido de textos para buscar «ideas» (for, if...) solo en el código real.
    const stripPy = c => c.replace(/(#[^\n]*)|("""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/g, (m, cm) => (cm ? "" : '""'));
    const stripJs = c => c.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)/g, (m, cm) => (cm ? "" : '""'));
    const STRIP = { python: stripPy, js: stripJs, html: c => c.replace(/<!--[\s\S]*?-->/g, ""), css: c => c.replace(/\/\*[\s\S]*?\*\//g, "") };
    FC.stripCode = (code, lang) => (STRIP[lang || "python"] || STRIP.python)(code);
    const showLines = arr => arr.length ? arr.slice(0, 4).map(x => "«" + x + "»").join(" ") + (arr.length > 4 ? " …" : "") : "(nada)";
    // Cambia la línea donde se crea una variable por otro valor (para probar el programa con otros datos).
    function applySet(code, set, lang) {
        let out = code;
        for (const name of Object.keys(set)) {
            const re = lang === "js"
                ? new RegExp("^([ \\t]*)(let|const|var)([ \\t]+)" + name + "[ \\t]*=(?!=)[^;\\n]*;?", "m")
                : new RegExp("^([ \\t]*)" + name + "[ \\t]*=(?!=).*$", "m");
            if (!re.test(out)) return null;
            out = lang === "js" ? out.replace(re, (m, sp, kw, ws) => sp + kw + ws + name + " = " + set[name] + ";") : out.replace(re, (m, sp) => sp + name + " = " + set[name]);
        }
        return out;
    }
    const sameValue = (got, exp) => {
        if (typeof exp === "boolean") return got === exp;
        if (typeof exp === "number") return typeof got === "number" && Math.abs(got - exp) < 1e-9;
        if (typeof exp === "string") return norm(got) === norm(exp);
        return JSON.stringify(got) === JSON.stringify(exp);
    };
    const fmtVal = (v, lang) => v === undefined ? "" : (typeof v === "string" ? `"${v}"` : typeof v === "boolean" ? (lang === "js" ? String(v) : (v ? "True" : "False")) : String(v));

    FC.Check = {
        // Devuelve {ok, msgs[], res}
        async run(code, spec, onStatus, ctx) {
            spec = spec || {}; ctx = ctx || {};
            const lang = ctx.lang || "python";
            if (lang === "html" || lang === "css") return FC.Web.check(code, spec, ctx.step, lang, onStatus);
            const RUN = (c, o) => (lang === "js" ? FC.JSRun.run(c, o) : FC.Py.run(c, o));
            const res = await RUN(code, { onStatus });
            if (res.error) return { ok: false, res, msgs: ["Tu programa tiene un error y no pudo terminar. Lee el mensaje de abajo, ¡te dice qué revisar!"] };
            const msgs = [];
            const clean = FC.stripCode(code, lang);
            (spec.requires || []).forEach(r => { if (!r.re.test(clean)) msgs.push(r.msg); });
            if (spec.stdout !== undefined && !sameLines(outLines(res.stdout), outLines(spec.stdout)))
                msgs.push(`Tu programa mostró ${showLines(outLines(res.stdout))} pero esperábamos ${showLines(outLines(spec.stdout))}.`);
            if (spec.vars) Object.keys(spec.vars).forEach(k => {
                const v = res.vars[k];
                if (!v) msgs.push(`No encontramos la variable «${k}». Revisa cómo la escribiste (las mayúsculas y las tildes cuentan).`);
                else if (!sameValue(v.value, spec.vars[k])) msgs.push(`La variable «${k}» debería valer ${fmtVal(spec.vars[k], lang)}, pero vale ${v.repr}.`);
            });
            if (spec.types) Object.keys(spec.types).forEach(k => {
                const v = res.vars[k];
                if (v && v.type !== spec.types[k]) msgs.push(`La variable «${k}» debería ser de tipo ${spec.types[k]}, pero es ${v.type}.`);
                else if (!v && !(spec.vars && spec.vars[k] !== undefined)) msgs.push(`No encontramos la variable «${k}».`);
            });
            if (msgs.length) return { ok: false, res, msgs };
            // Pruebas con otros valores: se cambia una variable y se vuelve a ejecutar.
            for (const v of (spec.variants || [])) {
                const c2 = applySet(code, v.set, lang);
                if (c2 === null) return { ok: false, res, msgs: [`Mantén al inicio la línea donde se crea ${Object.keys(v.set).map(k => "«" + k + "»").join(", ")} (por ejemplo ${Object.keys(v.set)[0]} = ...), la usaremos para probar tu programa con otros valores.`] };
                const r2 = await RUN(c2, { onStatus });
                const label = Object.keys(v.set).map(k => `${k} = ${v.set[k]}`).join(", ");
                if (r2.error) return { ok: false, res, msgs: [`Con ${label} tu programa dio un error: ${r2.error.friendly}`] };
                if (!sameLines(outLines(r2.stdout), outLines(v.stdout)))
                    return { ok: false, res, msgs: [`Tu programa funciona con algunos valores, pero cuando ${label} mostró ${showLines(outLines(r2.stdout))} y debía mostrar ${showLines(outLines(v.stdout))}.`] };
            }
            // Pruebas ocultas: se añaden llamadas al final y se compara lo NUEVO que se muestra.
            const base = outLines(res.stdout);
            for (const c of (spec.cases || [])) {
                const r2 = await RUN(code + "\n" + c.append, { onStatus });
                const call = c.append.split("\n").pop();
                if (r2.error) return { ok: false, res, msgs: [`Al probar  ${call}  hubo un error: ${r2.error.friendly}`] };
                const exp = base.concat(outLines(c.stdout));
                if (!sameLines(outLines(r2.stdout), exp)) {
                    const got = outLines(r2.stdout).slice(base.length);
                    return { ok: false, res, msgs: [c.msg ? c.msg : `Al probar  ${call}  esperábamos ver ${showLines(outLines(c.stdout))} pero se mostró ${showLines(got)}.`] };
                }
            }
            if (spec.custom) { const m = spec.custom(res, code); if (m) return { ok: false, res, msgs: [m] }; }
            return { ok: true, res, msgs: [] };
        }
    };

    /* =====================================================
       2. ESCENARIO VISUAL
       ===================================================== */
    function iconFor(name, type) {
        const n = norm(name);
        if (/semilla/.test(n)) return "seed";
        if (/agua|litro|gota|balde|riego/.test(n)) return "drop";
        if (/zanahoria/.test(n)) return "carrot";
        if (/tomate/.test(n)) return "tomato";
        if (/calabaza/.test(n)) return "pumpkin";
        if (/moneda|dinero|precio/.test(n)) return "coin";
        return null;
    }
    function valueVisual(name, v) {
        const val = v.value;
        const t = { number: Number.isInteger(v.value) ? "int" : "float", string: "str", boolean: "bool", array: "list" }[v.type] || v.type;
        if (t === "int" || t === "float") {
            const ic = iconFor(name, t);
            if (ic && val >= 0 && val <= 40) {
                const whole = Math.floor(val + 1e-9), frac = val - whole;
                let h = "";
                for (let i = 0; i < whole; i++) h += `<span class="pop" style="animation-delay:${Math.min(i, 14) * 40}ms">${ico(ic, 26)}</span>`;
                if (frac > 0.05) h += `<span class="pop half">${ico(ic, 26)}</span>`;
                return `<div class="crate-items">${h || "<small>vacío</small>"}</div><div class="crate-val">${esc(v.repr)}</div>`;
            }
            return `<div class="crate-num">${esc(v.repr)}</div>`;
        }
        if (t === "str") return `<div class="crate-sign">${esc(String(val).slice(0, 40))}</div>`;
        if (t === "bool") return `<div class="crate-bool ${val ? "yes" : "no"}">${ico(val ? "check" : "lock", 22)}<b>${val ? "True" : "False"}</b></div>`;
        if (t === "list") return `<div class="crate-list">${(val || []).slice(0, 10).map(x => `<span>${esc(typeof x === "string" ? x : String(x))}</span>`).join("") || "<small>lista vacía</small>"}</div>`;
        if (t === "function") return `<div class="crate-fn">${ico("book", 24)}<b>función</b></div>`;
        return `<div class="crate-num">${esc(v.repr || "None")}</div>`;
    }
    const prevVars = new WeakMap();
    function crates(res, host) {
        const names = Object.keys(res.vars || {});
        const prev = prevVars.get(host) || {};
        const wrap = el("div", "crates");
        names.forEach(n => {
            const v = res.vars[n], changed = !prev[n] || prev[n] !== v.repr;
            const c = el("div", "crate" + (changed ? " changed" : ""));
            c.innerHTML = `<div class="crate-label"><code>${esc(n)}</code><small>${esc(v.type)}</small></div>${valueVisual(n, v)}`;
            wrap.appendChild(c);
        });
        const snap = {}; names.forEach(n => (snap[n] = res.vars[n].repr)); prevVars.set(host, snap);
        return wrap;
    }
    function renderStage(host, kind, res, opts) {
        host.innerHTML = "";
        host.className = "stage stage-" + kind;
        const lines = res && res.stdout ? res.stdout.replace(/\n$/, "").split("\n").filter((x, i, a) => !(x === "" && i === a.length - 1)) : [];
        if (kind === "seed") {
            host.innerHTML = `<div class="seed-hero">${ico("seed", 96)}<p>Un dato</p></div><div class="arrow">→</div><div class="seed-hero">${ico("bag", 72)}<p>Una variable con nombre</p></div>`;
            return;
        }
        if (!res) { host.innerHTML = `<div class="stage-empty">${ico("farm", 40)}<p>Pulsa <b>▶ Ejecutar</b> y mira qué pasa en tu granja.</p></div>`; return; }
        if (res.error && !(res.vars && Object.keys(res.vars).length)) { host.innerHTML = `<div class="stage-empty">${ico("help", 40)}<p>Tu programa necesita un arreglo. ¡Mira el mensaje de abajo!</p></div>`; return; }
        if (kind === "loop") {
            const n = Math.max(1, Math.min(lines.length, 12));
            const row = el("div", "pots");
            for (let i = 0; i < n; i++) {
                const p = el("div", "pot");
                p.innerHTML = `<span class="drop" style="animation-delay:${i * 380}ms">${ico("drop", 22)}</span><span class="plant" style="animation-delay:${i * 380 + 260}ms">${ico("carrot", 36)}</span><i class="soil"></i><small>${i + 1}</small>`;
                row.appendChild(p);
            }
            host.appendChild(row);
            host.appendChild(el("div", "loop-count", lines.length ? `El programa repitió la acción <b>${lines.length}</b> ${lines.length === 1 ? "vez" : "veces"}.` : "No se mostró nada todavía."));
            if (Object.keys(res.vars || {}).length) host.appendChild(crates(res, host));
            return;
        }
        if (kind === "speech") {
            const row = el("div", "speech-row");
            const img = el("img", "speaker"); img.alt = "Tu personaje"; img.src = FC.Sprites.charPreview(FC.state.avatar, "down").toDataURL();
            const bubble = el("div", "bubble"); bubble.innerHTML = lines.length ? lines.slice(0, 5).map(l => `<div>${esc(l)}</div>`).join("") : "…";
            row.appendChild(img); row.appendChild(bubble); host.appendChild(row);
            if (Object.keys(res.vars || {}).length) host.appendChild(crates(res, host));
            return;
        }
        if (kind === "function") {
            const fns = Object.keys(res.vars || {}).filter(k => res.vars[k].type === "function");
            const m = el("div", "machine");
            m.innerHTML = `<div class="m-title">${ico("book", 30)}<b>${fns.length ? fns.map(f => esc(f) + "()").join("  ") : "Todavía no hay funciones"}</b></div><div class="m-belt">${lines.slice(0, 6).map((l, i) => `<span class="m-item" style="animation-delay:${i * 220}ms">${esc(l)}</span>`).join("") || "<small>Aquí saldrá lo que muestren tus funciones.</small>"}</div>`;
            host.appendChild(m);
            const rest = { vars: {} }; Object.keys(res.vars || {}).forEach(k => { if (res.vars[k].type !== "function") rest.vars[k] = res.vars[k]; });
            if (Object.keys(rest.vars).length) host.appendChild(crates(rest, host));
            return;
        }
        // por defecto: el estante de variables
        if (Object.keys(res.vars || {}).length) host.appendChild(crates(res, host));
        else host.innerHTML = `<div class="stage-empty">${ico("bag", 40)}<p>Todavía no hay variables en el estante.</p></div>`;
    }

    /* =====================================================
       3. EDITOR DE CÓDIGO
       ===================================================== */
    function makeEditor(initial, onRun, lang) {
        const box = el("div", "editor");
        const gut = el("div", "gutter"), ta = el("textarea");
        ta.spellcheck = false; ta.setAttribute("autocapitalize", "off"); ta.setAttribute("autocorrect", "off"); ta.setAttribute("autocomplete", "off");
        ta.setAttribute("wrap", "off"); ta.setAttribute("aria-label", "Editor de código"); ta.value = initial;
        const upd = () => { const n = ta.value.split("\n").length; let s = ""; for (let i = 1; i <= n; i++) s += i + "\n"; gut.textContent = s; gut.scrollTop = ta.scrollTop; };
        ta.addEventListener("input", upd); ta.addEventListener("scroll", () => (gut.scrollTop = ta.scrollTop));
        ta.addEventListener("keydown", e => {
            if (e.key === "Tab") {
                e.preventDefault();
                const s = ta.selectionStart, en = ta.selectionEnd;
                ta.setRangeText("    ", s, en, "end"); ta.dispatchEvent(new Event("input"));
            } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onRun(); }
            else if (e.key === "Enter" && !e.shiftKey) {
                // sangría automática: copia la de la línea anterior (+4 si termina en «:»)
                const s = ta.selectionStart, before = ta.value.slice(0, s), line = before.slice(before.lastIndexOf("\n") + 1);
                const opens = lang === "python" || !lang ? /:\s*$/.test(line.split("#")[0]) : (lang === "js" || lang === "css") ? /[{(\[]\s*$/.test(line) : false;
                const indent = /^ */.exec(line)[0] + (opens ? "    " : "");
                if (indent) { e.preventDefault(); ta.setRangeText("\n" + indent, s, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input")); }
            }
        });
        box.appendChild(gut); box.appendChild(ta); upd();
        return { box, ta, set(v) { ta.value = v; upd(); }, get: () => ta.value };
    }
    function showOutput(host, res, extra) {
        host.innerHTML = "";
        if (!res) { host.innerHTML = `<div class="out-hint">La respuesta de tu programa aparecerá aquí.</div>`; return; }
        if (res.stdout) { const pre = el("pre", "out-text"); pre.textContent = res.stdout; host.appendChild(pre); }
        else if (!res.error) host.appendChild(el("div", "out-hint", "El programa terminó sin mostrar nada. (Usa print(...) para mostrar cosas.)"));
        if (res.error) {
            const e = el("div", "out-error");
            e.innerHTML = `<b>Ups, algo no salió como esperábamos</b><p></p><small></small>`;
            e.querySelector("p").textContent = res.error.friendly || res.error.message;
            e.querySelector("small").textContent = `Mensaje técnico: ${res.error.type}: ${res.error.message}${res.error.line ? " (línea " + res.error.line + ")" : ""}`;
            host.appendChild(e);
        }
    }

    /* =====================================================
       4. ESTADO DE LECCIONES Y CURSOS
       ===================================================== */
    const LS = id => { const s = FC.state.lessons; if (!s[id]) s[id] = { step: 0, done: false, steps: {}, code: {} }; if (!s[id].steps) s[id].steps = {}; if (!s[id].code) s[id].code = {}; return s[id]; };
    const courseOf = L => FC.COURSES[L.course || "python"];
    const unlockedIn = (c, i) => i === 0 || !!(FC.state.lessons[c.lessons[i - 1].id] && FC.state.lessons[c.lessons[i - 1].id].done);
    const courseLocked = c => FC.levelFromXp(FC.state.xp) < (c.minLevel || 1);
    const interactive = l => l.steps.filter(s => s.type !== "learn").length;
    const doneCount = l => Object.keys(LS(l.id).steps).filter(k => l.steps[k] && l.steps[k].type !== "learn").length;
    FC.Lessons = { unlockedIn, LS, courseLocked };

    let ui = null, curCourse = "python";

    /* =====================================================
       5. PANEL
       ===================================================== */
    FC.Panels.programming = {
        title: "Programación", icon: "book",
        render(body, opts) {
            ui = body; opts = opts || {};
            if (opts.lesson) openLesson(opts.lesson); else showPath(opts.course || curCourse);
        },
        onClose() { ui = null; saveDraft = () => { }; }
    };

    function showPath(cid) {
        const C = FC.COURSES[cid] || FC.COURSES.python; curCourse = C.id;
        ui.innerHTML = ""; ui.scrollTop = 0;
        saveDraft = () => { };
        // Pestañas de cursos
        const tabs = el("div", "course-tabs"); tabs.setAttribute("role", "tablist");
        FC.COURSE_ORDER.forEach(id => {
            const c = FC.COURSES[id], lock = courseLocked(c);
            const b = el("button", "course-tab" + (id === C.id ? " sel" : "") + (lock ? " locked" : "")); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(id === C.id));
            b.innerHTML = ico(lock ? "lock" : c.icon, 22) + `<span>${esc(c.short)}</span>`;
            b.title = lock ? `Se abre en el nivel ${c.minLevel}` : c.name;
            b.addEventListener("click", () => { FC.UI.sfx(lock ? "error" : "click"); if (lock) FC.UI.toast(`${c.short} se abre en el nivel ${c.minLevel}.`, "lock"); else showPath(id); });
            tabs.appendChild(b);
        });
        ui.appendChild(tabs);
        ui.appendChild(el("p", "intro", esc(C.intro)));
        if (C.area) {
            const A = FC.AREAS[C.area];
            ui.appendChild(el("div", "card area-hint", `${ico(A.icon, 32)}<div><b>${esc(A.name)}</b><p>Este curso tiene su propio lugar en el mapa. Sal de la granja, camina hasta allí y habla con ${esc(A.teacher)}: ¡cada lección que completes cambia el lugar!</p></div>`));
        }
        const done = C.lessons.filter(l => LS(l.id).done).length;
        const prog = el("div", "card");
        prog.innerHTML = `<div class="row"><b>Tu avance en ${esc(C.name)}</b><span class="spacer"></span><span class="chip green">${done} de ${C.lessons.length} lecciones</span></div><div class="bar" style="margin-top:8px"><i style="width:${done / C.lessons.length * 100}%"></i></div>`;
        ui.appendChild(prog);
        const path = el("div", "lesson-path");
        C.lessons.forEach((l, i) => {
            const ok = unlockedIn(C, i), s = LS(l.id), fin = s.done, started = Object.keys(s.steps).length > 0 || s.step > 0;
            const card = el("div", "card lesson-card" + (ok ? "" : " locked") + (fin ? " done" : ""));
            const total = interactive(l), dc = doneCount(l);
            card.innerHTML = `<div class="lc-num">${fin ? ico("check", 28) : ok ? i + 1 : ico("lock", 24)}</div>
                <div class="lc-body"><h3>${esc(l.title)}</h3><p>${esc(l.blurb)}</p>
                <div class="row" style="gap:4px"><span class="chip">${ico(l.icon, 14)}${esc(l.short)}</span><span class="chip gold">${ico("star", 14)}${l.xp} XP</span>${ok ? `<span class="chip ${fin ? "green" : "gray"}">${dc}/${total} retos</span>` : `<span class="chip gray">Termina la lección ${i} para abrirla</span>`}</div></div>`;
            const b = el("button", "pxbtn " + (fin ? "" : "primary")); b.type = "button"; b.disabled = !ok;
            b.textContent = fin ? "Repasar" : started ? "Continuar" : "Empezar";
            b.addEventListener("click", () => { FC.UI.sfx("click"); openLesson(l.id); });
            card.appendChild(b); path.appendChild(card);
        });
        ui.appendChild(path);
        ui.appendChild(el("h2", "sect", "Próximas zonas de aprendizaje"));
        const zones = [["lock", "Taller de C++", "Conoce otro lenguaje de programación. Necesita un servidor para ejecutarse de forma segura."], ["bag", "Granja de datos SQL / MySQL", "Aprende a organizar información con bases de datos."]];
        const g = el("div", "grid auto");
        zones.forEach(z => g.appendChild(el("div", "card zone-soon", `${ico(z[0], 32)}<div><b>${z[1]}</b><p>${z[2]}</p><span class="chip gray">Próximamente</span></div>`)));
        ui.appendChild(g);
    }

    /* ---------- Reproductor de lección ---------- */
    function openLesson(id) {
        const L = FC.LESSON_BY_ID(id); if (!L) return showPath(curCourse);
        const C = courseOf(L), idx = C.lessons.indexOf(L);
        if (courseLocked(C)) { FC.UI.toast(`${C.short} se abre en el nivel ${C.minLevel}.`, "lock"); return showPath("python"); }
        if (!unlockedIn(C, idx)) { FC.UI.toast("Completa la lección anterior primero.", "lock"); return showPath(C.id); }
        curCourse = C.id;
        const s = LS(id);
        showStep(L, Math.max(0, Math.min(s.step || 0, L.steps.length - 1)));
    }
    const stepDone = (L, i) => L.steps[i].type === "learn" || !!LS(L.id).steps[i];
    function maxReachable(L) { for (let i = 0; i < L.steps.length; i++) if (!stepDone(L, i)) return i; return L.steps.length - 1; }

    function showStep(L, i) {
        const s = LS(L.id), step = L.steps[i], C = courseOf(L);
        s.step = i; FC.Store.save(FC.state);
        ui.innerHTML = ""; ui.scrollTop = 0;
        const head = el("div", "lesson-head");
        const back = el("button", "pxbtn small", "← Lecciones"); back.type = "button"; back.addEventListener("click", () => { saveDraft(); showPath(C.id); });
        const num = C.lessons.indexOf(L) + 1;
        const title = el("h2", "lesson-title", `${ico(L.icon, 28)}<span>${esc(C.short)} · Lección ${num}: ${esc(L.title)}</span>`);
        const dots = el("div", "dots"); dots.setAttribute("role", "list");
        const reach = maxReachable(L);
        L.steps.forEach((st, k) => {
            const d = el("button", "dot" + (k === i ? " cur" : "") + (stepDone(L, k) && st.type !== "learn" ? " ok" : "") + (st.type === "learn" ? " learn" : ""));
            d.type = "button"; d.disabled = k > reach; d.title = st.title; d.setAttribute("aria-label", `Paso ${k + 1}: ${st.title}`);
            d.addEventListener("click", () => { saveDraft(); showStep(L, k); });
            dots.appendChild(d);
        });
        head.appendChild(back); head.appendChild(title); ui.appendChild(head); ui.appendChild(dots);
        if (step.type === "quiz") return renderQuiz(L, i, step);
        renderCodeStep(L, i, step);
    }
    let saveDraft = () => { };

    function navBar(L, i, canNext, extraNote) {
        const nav = el("div", "lesson-nav");
        const prev = el("button", "pxbtn", "← Anterior"); prev.type = "button"; prev.disabled = i === 0;
        prev.addEventListener("click", () => { saveDraft(); showStep(L, i - 1); });
        const last = i === L.steps.length - 1;
        const next = el("button", "pxbtn primary", last ? "Terminar lección ✓" : "Siguiente →"); next.type = "button"; next.disabled = !canNext;
        next.addEventListener("click", () => { saveDraft(); if (last) finishLesson(L); else { FC.UI.sfx("click"); showStep(L, i + 1); } });
        nav.appendChild(prev);
        const note = el("span", "nav-note", extraNote || ""); nav.appendChild(note);
        nav.appendChild(next);
        return { nav, next, note };
    }

    const LANG_NAMES = { python: "Python", js: "JavaScript", html: "HTML", css: "CSS" };
    function renderCodeStep(L, i, step) {
        const s = LS(L.id), isEx = step.type === "exercise", lang = L.lang || "python";
        const isWeb = lang === "html" || lang === "css";
        const grid = el("div", "lesson-grid");
        // --- Columna de texto
        const text = el("div", "card lesson-text");
        let html = `<h3 class="step-title">${isEx ? ico("trophy", 22) + " Reto: " : ""}${esc(step.title)}</h3>`;
        if (isEx) {
            html += `<span class="chip gold">${ico("book", 14)}Aprendes: ${esc(step.concept)}</span><span class="chip">${ico("star", 14)}${step.xp || 10} XP</span>`;
            html += `<div class="goal"><b>Qué debes conseguir</b><p>${step.goal}</p></div>`;
            if (step.example) html += `<div class="example"><b>Ejemplo</b><pre>${esc(step.example)}</pre></div>`;
        } else {
            html += (step.paras || []).map(p => `<p>${p}</p>`).join("");
            if (step.note) html += `<div class="note">${ico("help", 20)}<span>${step.note}</span></div>`;
        }
        if (lang === "css" && step.html) html += `<div class="example"><b>El HTML de la página (no se cambia)</b><pre>${esc(step.html)}</pre></div>`;
        text.innerHTML = html;
        let hintBox = null, shown = 0;
        if (isEx) {
            const review = el("button", "pxbtn small", "📖 Repasar la explicación"); review.type = "button";
            review.addEventListener("click", () => showReview(L, i));
            const hintBtn = el("button", "pxbtn small gold", "💡 Pista"); hintBtn.type = "button";
            hintBox = el("div", "hints"); hintBox.setAttribute("aria-live", "polite");
            const reveal = () => { if (shown < step.hints.length) { shown++; paintHints(); FC.UI.sfx("click"); } else FC.UI.toast("Ya viste todas las pistas. ¡Tú puedes!", "heart"); };
            const paintHints = () => { hintBox.innerHTML = step.hints.slice(0, shown).map((h, k) => `<div class="hint"><b>Pista ${k + 1}</b><pre>${esc(h)}</pre></div>`).join(""); };
            hintBtn.addEventListener("click", reveal);
            const row = el("div", "row"); row.appendChild(review); row.appendChild(hintBtn);
            text.appendChild(row); text.appendChild(hintBox);
            step._reveal = () => { if (shown < step.hints.length) { shown++; paintHints(); } };
        }
        // --- Columna del editor
        const codeCol = el("div", "card lesson-code");
        const initial = (s.code[i] !== undefined ? s.code[i] : (isEx ? step.starter : step.code)) || "";
        let busy = false;
        const editor = makeEditor(initial, () => runBtn.click(), lang);
        const out = el("div", "output"), feedback = el("div", "feedback hidden"), stage = el("div", "stage");
        const preview = isWeb ? FC.Web.makePreview() : null;
        const bar = el("div", "row code-bar");
        const runBtn = el("button", "pxbtn primary", isWeb ? "▶ Ver mi página" : "▶ Ejecutar"); runBtn.type = "button";
        const resetBtn = el("button", "pxbtn small", "↺ Restablecer"); resetBtn.type = "button";
        bar.appendChild(runBtn);
        let checkBtn = null;
        if (isEx) { checkBtn = el("button", "pxbtn gold", "✓ Comprobar"); checkBtn.type = "button"; bar.appendChild(checkBtn); }
        bar.appendChild(el("span", "spacer")); bar.appendChild(resetBtn);
        codeCol.appendChild(el("div", "col-title", `Tu código ${LANG_NAMES[lang] || ""}`));
        codeCol.appendChild(editor.box); codeCol.appendChild(bar);
        if (isWeb) {
            codeCol.appendChild(feedback);
            codeCol.appendChild(el("div", "col-title", "Así se ve tu página")); codeCol.appendChild(preview.box);
        } else {
            codeCol.appendChild(el("div", "col-title", lang === "js" ? "Lo que muestra console.log" : "Lo que muestra tu programa")); codeCol.appendChild(out); codeCol.appendChild(feedback);
            codeCol.appendChild(el("div", "col-title", lang === "js" ? "Tu campo por dentro" : "Tu granja por dentro")); codeCol.appendChild(stage);
        }
        const runner = (c, o) => (lang === "js" ? FC.JSRun.run(c, o) : FC.Py.run(c, o));
        const vis = step.visual || (lang === "js" ? "vars" : "vars");
        const showRes = res => { if (isWeb) return; showOutput(out, res); renderStage(stage, vis, res); };

        saveDraft = () => { const v = editor.get(); if (v !== (isEx ? step.starter : step.code)) s.code[i] = v.slice(0, 6000); else delete s.code[i]; FC.Store.save(FC.state); };
        const status = msg => { feedback.className = "feedback info"; feedback.textContent = msg; };
        const setBusy = b => { busy = b; runBtn.disabled = b; if (checkBtn) checkBtn.disabled = b; };
        const showPage = () => FC.Web.show(preview, FC.Web.buildDoc(lang, editor.get(), step));

        async function doRun() {
            if (isWeb) { showPage(); feedback.className = "feedback hidden"; FC.UI.sfx("click"); return null; }
            setBusy(true);
            const res = await runner(editor.get(), { onStatus: status });
            feedback.className = "feedback hidden";
            showRes(res);
            setBusy(false); FC.UI.sfx(res.error ? "error" : "click");
            return res;
        }
        runBtn.addEventListener("click", () => { if (!busy) doRun(); });
        resetBtn.addEventListener("click", () => {
            editor.set(isEx ? step.starter : step.code); delete s.code[i]; feedback.className = "feedback hidden";
            if (isWeb) showPage(); else { showOutput(out, null); renderStage(stage, vis, null); }
            FC.UI.toast("Código restablecido.", "check");
        });

        if (isEx) {
            let attempts = 0;
            const solvedNow = () => !!s.steps[i];
            const paintSolved = () => { feedback.className = "feedback ok"; feedback.innerHTML = `${ico("check", 22)}<b>¡Reto superado!</b> Ya puedes pasar al siguiente paso.`; };
            checkBtn.addEventListener("click", async () => {
                if (busy) return;
                setBusy(true); status("Comprobando tu programa…");
                const r = await FC.Check.run(editor.get(), step.check, status, { lang, step });
                if (isWeb) showPage(); else showRes(r.res);
                setBusy(false);
                if (r.ok) {
                    const first = !solvedNow();
                    s.steps[i] = true; FC.Store.save(FC.state);
                    feedback.className = "feedback ok";
                    feedback.innerHTML = `${ico("check", 22)}<b>¡Reto superado!</b> ${first ? `Ganaste ${step.xp || 10} XP. ` : ""}Ya puedes pasar al siguiente paso.`;
                    FC.UI.sfx("ok");
                    if (first) {
                        FC.state.stats.exercisesDone++;
                        FC.UI.toast(`¡Reto superado! +${step.xp || 10} XP`, "star");
                        FC.Progress.addXp(step.xp || 10, "exercise");
                        FC.event("exercise", { lesson: L.id, id: step.id, course: L.course });
                    }
                    nav.next.disabled = false; nav.note.textContent = "";
                    refreshDots(L, i);
                } else {
                    attempts++;
                    FC.UI.sfx("error");
                    feedback.className = "feedback err";
                    feedback.innerHTML = `<b>Casi… ¡sigue intentándolo!</b><ul>${r.msgs.map(m => `<li>${esc(m)}</li>`).join("")}</ul>`;
                    if (attempts >= 2 && step._reveal) { step._reveal(); }
                }
            });
            if (solvedNow()) paintSolved();
        }
        grid.appendChild(text); grid.appendChild(codeCol);
        ui.appendChild(grid);
        const nav = navBar(L, i, isEx ? !!s.steps[i] : true, isEx && !s.steps[i] ? "Supera el reto para continuar" : "");
        ui.appendChild(nav.nav);

        // Las páginas web se muestran enseguida (no hay peligro); los programas de las explicaciones se ejecutan solos.
        if (isWeb) showPage();
        else if (!isEx) { if (step.code) doRun(); else renderStage(stage, step.visual || "seed", null); }
        else { showOutput(out, null); renderStage(stage, vis, null); }
        if (isEx) setTimeout(() => editor.ta.focus({ preventScroll: true }), 50);
    }
    function refreshDots(L, i) {
        const dots = ui.querySelector(".dots"); if (!dots) return;
        const reach = maxReachable(L);
        [...dots.children].forEach((d, k) => { d.disabled = k > reach; if (L.steps[k].type !== "learn" && LS(L.id).steps[k]) d.classList.add("ok"); });
    }

    function renderQuiz(L, i, step) {
        const s = LS(L.id), done = !!s.steps[i];
        const card = el("div", "card quiz");
        card.innerHTML = `<h3 class="step-title">${ico("help", 22)} ${esc(step.title)}</h3><p class="quiz-q"></p><div class="quiz-opts"></div><div class="feedback hidden"></div>`;
        card.querySelector(".quiz-q").textContent = step.question;
        const opts = card.querySelector(".quiz-opts"), fb = card.querySelector(".feedback");
        const nav = navBar(L, i, done, done ? "" : "Elige la respuesta correcta para continuar");
        step.options.forEach((o, k) => {
            const b = el("button", "pxbtn quiz-opt"); b.type = "button"; b.textContent = o;
            b.addEventListener("click", () => {
                if (k === step.answer) {
                    b.classList.add("right"); opts.querySelectorAll("button").forEach(x => (x.disabled = true));
                    fb.className = "feedback ok"; fb.innerHTML = `${ico("check", 22)}<b>¡Correcto!</b> ${esc(step.explain)}`;
                    FC.UI.sfx("ok"); s.steps[i] = true; FC.Store.save(FC.state); nav.next.disabled = false; nav.note.textContent = ""; refreshDots(L, i);
                } else {
                    b.disabled = true; b.classList.add("wrong"); FC.UI.sfx("error");
                    fb.className = "feedback err"; fb.innerHTML = `<b>Casi.</b> Esa no es, pero ¡no pasa nada! Prueba con otra opción.`;
                }
            });
            opts.appendChild(b);
        });
        if (done) { opts.querySelectorAll("button")[step.answer].classList.add("right"); opts.querySelectorAll("button").forEach(x => (x.disabled = true)); fb.className = "feedback ok"; fb.innerHTML = `${ico("check", 22)}<b>¡Correcto!</b> ${esc(step.explain)}`; }
        ui.appendChild(card); ui.appendChild(nav.nav);
        saveDraft = () => { };
    }

    // Repaso de explicaciones sin perder lo que escribiste.
    function showReview(L, upTo) {
        const node = el("div", "review");
        L.steps.slice(0, upTo + 1).filter(s => s.type === "learn").forEach(s => {
            const d = el("div", "review-item");
            d.innerHTML = `<h4>${esc(s.title)}</h4>${(s.paras || []).map(p => `<p>${p}</p>`).join("")}${s.code ? `<pre>${esc(s.code)}</pre>` : ""}${s.note ? `<div class="note">${s.note}</div>` : ""}`;
            node.appendChild(d);
        });
        FC.UI.dialog({ icon: "book", title: "Repaso de la lección", node, button: "Volver al reto", cls: "review-dlg" });
    }

    function finishLesson(L) {
        const s = LS(L.id), first = !s.done;
        if (first) {
            s.done = true; FC.state.stats.lessonsDone++; FC.Store.saveNow(FC.state);
            const r = Object.assign({ xp: L.xp }, L.reward);
            FC.UI.sfx("quest");
            // Primero la ventana de la lección y después (si corresponde) la de nivel nuevo.
            FC.UI.popup({ icon: L.icon, title: "¡Lección completada!", subtitle: L.title, body: "", lines: FC.rewardLines(r), button: "Continuar" });
            FC.Progress.grant(r);
            FC.event("lesson", { id: L.id, amount: 1, course: L.course || "python" });
            FC.Pets.check();
            FC.Missions.refresh();
        } else FC.UI.toast("¡Lección repasada!", "check");
        s.step = 0; FC.Store.save(FC.state);
        showPath(courseOf(L).id);
        ui.scrollTop = 0; document.getElementById("panel-body").scrollTop = 0;
    }
})();
