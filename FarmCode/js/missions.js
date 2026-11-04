/* ==========================================================
   missions.js — XP, niveles, misiones y logros
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const lvl = () => FC.levelFromXp(FC.state.xp);

    /* ---------- MISIONES ----------
       on: evento que cuenta · target: cuántas veces · filter: condición extra
       check: en vez de eventos, calcula el progreso desde el estado del juego
       requires / minLevel: condiciones de desbloqueo */
    FC.MISSIONS = [
        { id: "m_walk", icon: "farm", name: "Reconocer la granja", desc: "Entra al huerto cercado que está al noroeste del mapa.", goal: "Entrar al huerto", on: "zone", filter: d => d.id === "field", target: 1, reward: { xp: 10, coins: 5 } },
        { id: "m_lesson1", icon: "snake", name: "Aprendiz de Python", desc: "Visita el letrero del Huerto de Python y completa la lección «La semilla de Python».", goal: "Completar la lección 1", on: "lesson", filter: d => d.id === "l1", target: 1, reward: { xp: 20, seeds: { carrot: 3 } } },
        { id: "m_plant", icon: "seed", name: "Primera siembra", desc: "Acércate a una parcela y siembra una semilla.", goal: "Sembrar 1 semilla", on: "plant", target: 1, requires: ["m_walk"], reward: { xp: 10, seeds: { carrot: 2 } } },
        { id: "m_water", icon: "drop", name: "Riego diario", desc: "Riega dos plantas con tu regadera. ¡Las plantas regadas crecen más rápido y dan más cosecha!", goal: "Regar 2 plantas", on: "water", target: 2, requires: ["m_plant"], reward: { xp: 10, coins: 5 } },
        { id: "m_harvest1", icon: "carrot", name: "Primera cosecha", desc: "Espera a que tu cultivo esté listo y coséchalo.", goal: "Cosechar 1 cultivo", on: "harvest", target: 1, requires: ["m_plant"], reward: { xp: 15, coins: 10 } },
        { id: "m_sell", icon: "coin", name: "Pequeño comerciante", desc: "Vende tu cosecha en el puesto del mercado, junto al camino de la casa.", goal: "Vender 3 cultivos", on: "sell", target: 3, requires: ["m_harvest1"], reward: { xp: 15, seeds: { tomato: 2 } } },
        { id: "m_style", icon: "hero", name: "Estrenando look", desc: "Abre «Mi personaje», cambia tu apariencia y guarda los cambios.", goal: "Guardar tu personaje", on: "avatar", target: 1, reward: { xp: 10, coins: 5 } },
        { id: "m_harvest5", icon: "tomato", name: "Buen agricultor", desc: "Demuestra tu mano verde: cosecha cinco cultivos.", goal: "Cosechar 5 cultivos", on: "harvest", target: 5, requires: ["m_harvest1"], reward: { xp: 25, seeds: { tomato: 3 } } },
        { id: "m_lessons3", icon: "book", name: "Programador de granja", desc: "Completa tres lecciones del Huerto de Python.", goal: "Completar 3 lecciones", on: "lesson", filter: d => (d.course || "python") === "python", target: 3, requires: ["m_lesson1"], reward: { xp: 30, coins: 20 } },
        { id: "m_level3", icon: "star", name: "Subiendo de nivel", desc: "Gana experiencia cosechando, completando misiones y aprendiendo. Llega al nivel 3.", goal: "Alcanzar el nivel 3", check: () => lvl(), target: 3, reward: { xp: 0, coins: 30 } },
        { id: "m_gate", icon: "lock", name: "El huerto avanzado", desc: "Con el nivel 3 puedes abrir el portón del huerto avanzado, al sureste del mapa.", goal: "Abrir el portón", on: "gate", target: 1, requires: ["m_level3"], reward: { xp: 30, seeds: { pumpkin: 3 } } },
        { id: "m_pet", icon: "paw", name: "Un nuevo amigo", desc: "Desbloquea una segunda mascota. ¡Mira en «Mis mascotas» cómo conseguirlas!", goal: "Tener 2 mascotas", check: () => FC.state.pets.unlocked.length, target: 2, reward: { xp: 20, coins: 10 } },
        { id: "m_python", icon: "trophy", name: "Graduado del Huerto", desc: "Completa las 8 lecciones del Huerto de Python.", goal: "Completar las 8 lecciones", on: "lesson", filter: d => (d.course || "python") === "python", target: 8, requires: ["m_lessons3"], reward: { xp: 100, coins: 50, special: "python_badge" } },
        { id: "m_explore", icon: "farm", name: "Explorador de zonas", desc: "Sal de la granja y visita las tres zonas de aprendizaje: el Taller HTML (al sur), el Invernadero CSS (al oeste) y el Campo JavaScript (al este). Cada zona se abre con un nivel.", goal: "Visitar las 3 zonas", on: "area", filter: d => d.first, target: 3, reward: { xp: 40, coins: 20 } },
        { id: "m_html", icon: "brick", name: "Constructor de páginas", desc: "Completa las 5 lecciones del Taller de Construcción HTML y termina la casa.", goal: "Completar el curso de HTML", on: "lesson", filter: d => d.course === "html", target: 5, reward: { xp: 60, coins: 30 } },
        { id: "m_css", icon: "brush", name: "Diseñador del invernadero", desc: "Completa las 5 lecciones del Invernadero CSS y haz florecer todas las macetas.", goal: "Completar el curso de CSS", on: "lesson", filter: d => d.course === "css", target: 5, reward: { xp: 80, coins: 40 } },
        { id: "m_js", icon: "gear", name: "Ingeniero del campo", desc: "Completa las 6 lecciones del Campo de Máquinas JavaScript y enciende todas las máquinas.", goal: "Completar el curso de JavaScript", on: "lesson", filter: d => d.course === "js", target: 6, reward: { xp: 100, coins: 50, special: "web_badge" } }
    ];
    const byId = id => FC.MISSIONS.find(m => m.id === id);

    const courseDone = (s, id) => !!(FC.COURSES && FC.COURSES[id]) && FC.COURSES[id].lessons.every(l => s.lessons[l.id] && s.lessons[l.id].done);

    /* ---------- LOGROS ---------- */
    FC.ACHIEVEMENTS = [
        { id: "a_seed", icon: "seed", name: "Manos en la tierra", desc: "Siembra tu primera semilla.", check: s => s.stats.planted >= 1 },
        { id: "a_harvest10", icon: "carrot", name: "Cosechador", desc: "Cosecha 10 cultivos.", check: s => s.stats.harvested >= 10 },
        { id: "a_rich", icon: "coin", name: "Ahorrador", desc: "Gana 100 monedas vendiendo.", check: s => s.stats.coinsEarned >= 100 },
        { id: "a_code1", icon: "book", name: "Primera línea de código", desc: "Completa tu primer ejercicio de Python.", check: s => s.stats.exercisesDone >= 1 },
        { id: "a_code15", icon: "snake", name: "Mente curiosa", desc: "Resuelve 15 ejercicios.", check: s => s.stats.exercisesDone >= 15 },
        { id: "a_lesson4", icon: "scroll", name: "A mitad del camino", desc: "Completa 4 lecciones.", check: s => s.stats.lessonsDone >= 4 },
        { id: "a_python", icon: "trophy", name: "Maestro del Huerto", desc: "Completa las 8 lecciones de Python.", check: s => FC.LESSONS.every(l => s.lessons[l.id] && s.lessons[l.id].done) },
        { id: "a_html", icon: "brick", name: "Maestro constructor", desc: "Completa el curso de HTML.", check: s => courseDone(s, "html") },
        { id: "a_css", icon: "brush", name: "Artista del invernadero", desc: "Completa el curso de CSS.", check: s => courseDone(s, "css") },
        { id: "a_js", icon: "gear", name: "Ingeniero de máquinas", desc: "Completa el curso de JavaScript.", check: s => courseDone(s, "js") },
        { id: "a_explorer", icon: "farm", name: "Gran explorador", desc: "Visita las tres zonas de aprendizaje.", check: s => Object.keys(s.flags.areasVisited || {}).length >= 3 },
        { id: "a_lvl5", icon: "star", name: "Nivel 5", desc: "Alcanza el nivel 5.", check: s => FC.levelFromXp(s.xp) >= 5 },
        { id: "a_pets", icon: "paw", name: "Amigo de los animales", desc: "Desbloquea las tres mascotas.", check: s => s.pets.unlocked.length >= 3 },
        { id: "a_missions5", icon: "heart", name: "Siempre ocupado", desc: "Completa 5 misiones.", check: s => Object.values(s.missions).filter(m => m.status === "done").length >= 5 }
    ];

    /* ---------- PROGRESO ---------- */
    const lines = r => {
        const out = [];
        if (r.xp) out.push({ icon: "star", text: `+${r.xp} XP` });
        if (r.coins) out.push({ icon: "coin", text: `+${r.coins} monedas` });
        if (r.seeds) Object.keys(r.seeds).forEach(id => out.push({ icon: "seed", text: `${r.seeds[id]} semilla${r.seeds[id] > 1 ? "s" : ""} de ${FC.CROPS[id].name.toLowerCase()}` }));
        if (r.special) out.push({ icon: FC.SPECIALS[r.special].icon, text: FC.SPECIALS[r.special].name });
        return out;
    };
    FC.rewardLines = lines;

    FC.Progress = {
        level: lvl,
        addXp(n, src) {
            if (!n) return;
            const st = FC.state, before = lvl();
            st.xp += n;
            FC.UI.floatText(`+${n} XP`, "xp");
            FC.Store.save(st);
            FC.bus.emit("xp");
            const after = lvl();
            if (after > before) FC.Progress.levelUp(before, after);
        },
        addCoins(n) { if (!n) return; FC.state.coins += n; FC.state.stats.coinsEarned += n; FC.Store.save(FC.state); FC.bus.emit("inventory"); },
        // Da una recompensa completa (sin popup). Devuelve las líneas para mostrar.
        grant(r) {
            if (r.coins) FC.Progress.addCoins(r.coins);
            if (r.seeds) Object.keys(r.seeds).forEach(id => FC.Inventory.addSeeds(id, r.seeds[id]));
            if (r.special) FC.Inventory.addSpecial(r.special);
            if (r.xp) FC.Progress.addXp(r.xp, "reward");
            return lines(r);
        },
        levelUp(before, after) {
            const unlocks = [];
            for (let L = before + 1; L <= after; L++) {
                FC.CROP_ORDER.forEach(id => { if (FC.CROPS[id].minLevel === L) unlocks.push({ icon: FC.CROPS[id].icon, text: `Semillas de ${FC.CROPS[id].name.toLowerCase()} en el mercado` }); });
                Object.values(FC.AVATAR_OPTIONS).forEach(list => list.forEach(o => { if (o.minLevel === L) unlocks.push({ icon: "hero", text: `Nueva apariencia: ${o.n}` }); }));
                FC.PET_ORDER.forEach(id => { const u = FC.PETS[id].unlock; if (u.type === "level" && u.value === L) unlocks.push({ icon: "paw", text: `Mascota: ${FC.PETS[id].name}` }); });
                if (L === 3) unlocks.push({ icon: "lock", text: "Portón del huerto avanzado" });
            }
            FC.UI.sfx("level");
            FC.UI.popup({ icon: "star", title: `¡Nivel ${after}!`, body: "Tu granja y tus conocimientos siguen creciendo.", lines: unlocks, button: "¡Seguir!" });
            FC.bus.emit("level", { level: after });
            FC.Pets.check();
            FC.Missions.refresh();
            FC.Achievements.check();
        }
    };

    FC.Missions = {
        defs: FC.MISSIONS,
        get(id) { return FC.state.missions[id] || { status: "locked", progress: 0 }; },
        // Número que se muestra como progreso.
        progress(def) {
            const m = FC.state.missions[def.id];
            if (m && m.status === "done") return def.target;
            if (def.check) return Math.min(def.target, def.check());
            return m ? Math.min(def.target, m.progress || 0) : 0;
        },
        // Desbloquea misiones cuyos requisitos ya se cumplen y completa las de tipo "check".
        refresh() {
            const st = FC.state; let changed = false;
            FC.MISSIONS.forEach(def => {
                let m = st.missions[def.id];
                if (!m) { m = st.missions[def.id] = { status: "locked", progress: 0 }; changed = true; }
                if (m.status === "locked") {
                    const reqOk = (def.requires || []).every(r => st.missions[r] && st.missions[r].status === "done");
                    const lvOk = !def.minLevel || lvl() >= def.minLevel;
                    if (reqOk && lvOk) { m.status = "active"; changed = true; if (st.flags.welcomed) FC.UI.toast(`Nueva misión: ${def.name}`, "scroll"); }
                }
            });
            if (changed) FC.Store.save(st);
            // Las misiones "check" se completan solas cuando se cumple la condición.
            FC.MISSIONS.forEach(def => {
                const m = st.missions[def.id];
                if (m.status === "active" && def.check && def.check() >= def.target) FC.Missions.complete(def);
            });
        },
        notify(name, data) {
            const st = FC.state; data = data || {};
            FC.MISSIONS.forEach(def => {
                const m = st.missions[def.id];
                if (!m || m.status !== "active" || def.on !== name) return;
                if (def.filter && !def.filter(data)) return;
                m.progress = (m.progress || 0) + (data.amount || 1);
                if (m.progress >= def.target) FC.Missions.complete(def);
                else FC.bus.emit("mission-progress", def);
            });
            FC.Store.save(st);
        },
        // Se completa UNA sola vez: el estado pasa a "done" antes de dar el premio.
        complete(def) {
            const m = FC.state.missions[def.id];
            if (!m || m.status === "done") return;
            m.status = "done"; m.progress = def.target;
            FC.Store.save(FC.state);
            const rewardLines = FC.Progress.grant(def.reward);
            FC.UI.sfx("quest");
            FC.UI.popup({ icon: "trophy", title: "¡Misión completada!", subtitle: def.name, body: "", lines: rewardLines, button: "Continuar" });
            FC.bus.emit("mission-done", def);
            FC.Missions.refresh();
            FC.Achievements.check();
        },
        counts() { const done = FC.MISSIONS.filter(d => FC.state.missions[d.id] && FC.state.missions[d.id].status === "done").length; return { done, total: FC.MISSIONS.length }; }
    };

    FC.Achievements = {
        check() {
            const st = FC.state;
            FC.ACHIEVEMENTS.forEach(a => {
                if (st.achievements[a.id]) return;
                if (a.check(st)) {
                    st.achievements[a.id] = Date.now();
                    FC.Store.save(st);
                    FC.UI.toast(`Logro: ${a.name}`, "trophy");
                    FC.bus.emit("achievement", a);
                    FC.Progress.addXp(10, "achievement");
                }
            });
        }
    };

    // Todo lo que pasa en el juego se anuncia con FC.event(...)
    FC.event = function (name, data) {
        FC.Missions.notify(name, data);
        FC.Achievements.check();
        FC.bus.emit("game-event", { name, data });
    };
})();
