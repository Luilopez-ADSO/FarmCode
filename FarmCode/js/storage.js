/* ==========================================================
   storage.js — Guardado del progreso
   ----------------------------------------------------------
   AHORA: todo se guarda en este navegador (localStorage), en
   "perfiles locales". NO son cuentas reales: no hay contraseña.
   DESPUÉS: cuando exista el backend, solo hay que cambiar las
   funciones de este archivo (loadProfile / saveNow /
   listProfiles). El resto del juego no necesita cambios.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});

    // Pequeño sistema de eventos para que los módulos se avisen entre sí.
    const listeners = {};
    FC.bus = {
        on(name, fn) { (listeners[name] = listeners[name] || []).push(fn); },
        emit(name, data) { (listeners[name] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); }
    };

    const INDEX_KEY = "farmcode.v1.index";
    const PROFILE_KEY = id => "farmcode.v1.profile." + id;

    function uid() { return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

    function newState(username) {
        const name = (username || "Granjero").slice(0, 16);
        return {
            v: 1,
            id: uid(),
            username: name,
            createdAt: Date.now(),
            avatar: {
                name: name, skin: "#f2c29b", hairStyle: "corto", hairColor: "#5a3a20",
                shirt: "#4e8b4a", pants: "#3f5aa0", hat: "paja", accessory: "ninguno"
            },
            xp: 0,
            coins: 20,
            inv: {
                seeds: { carrot: 3, tomato: 0, pumpkin: 0 },
                crops: { carrot: 0, tomato: 0, pumpkin: 0 },
                tools: { hoe: 1, can: 1 },
                special: {}
            },
            selectedSeed: "carrot",
            plots: {},
            pets: { unlocked: ["dog"], active: "dog" },
            missions: {},
            stats: { planted: 0, watered: 0, harvested: 0, sold: 0, lessonsDone: 0, exercisesDone: 0, coinsEarned: 0, avatarSaved: 0 },
            lessons: {},
            achievements: {},
            flags: { welcomed: false, gateOpen: false, visitedField: false, areasVisited: {} },
            area: "farm",
            player: { x: 150, y: 214, dir: "down" },
            settings: { sound: true }
        };
    }

    // Mezcla lo guardado con los valores por defecto (así no se rompe si falta algo).
    function merge(base, saved) {
        if (saved === null || typeof saved !== "object" || Array.isArray(saved)) return saved === undefined ? base : saved;
        const out = { ...base };
        for (const k of Object.keys(saved)) {
            if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
            const b = base ? base[k] : undefined;
            out[k] = (b && typeof b === "object" && !Array.isArray(b) && saved[k] && typeof saved[k] === "object" && !Array.isArray(saved[k]))
                ? merge(b, saved[k]) : saved[k];
        }
        return out;
    }

    function readIndex() {
        try {
            const idx = JSON.parse(localStorage.getItem(INDEX_KEY) || "null");
            if (idx && Array.isArray(idx.profiles)) return idx;
        } catch (e) { /* se usa el valor por defecto */ }
        return { active: null, profiles: [] };
    }
    function writeIndex(idx) {
        try { localStorage.setItem(INDEX_KEY, JSON.stringify(idx)); } catch (e) { console.warn("No se pudo guardar el índice", e); }
    }

    let saveTimer = null;
    FC.Store = {
        newState,
        listProfiles() { return readIndex().profiles.slice(); },
        activeId() { return readIndex().active; },
        setActive(id) { const idx = readIndex(); idx.active = id; writeIndex(idx); },

        loadProfile(id) {
            try {
                const raw = JSON.parse(localStorage.getItem(PROFILE_KEY(id)) || "null");
                if (raw && typeof raw === "object") return merge(newState(raw.username), raw);
            } catch (e) { console.warn("Perfil dañado", e); }
            return null;
        },
        // Devuelve el perfil activo o null si es la primera vez.
        loadActive() {
            const id = readIndex().active;
            return id ? this.loadProfile(id) : null;
        },
        createProfile(username) {
            const st = newState(username);
            const idx = readIndex();
            idx.profiles.push({ id: st.id, username: st.username, updated: Date.now(), level: 1 });
            idx.active = st.id;
            writeIndex(idx);
            try { localStorage.setItem(PROFILE_KEY(st.id), JSON.stringify(st)); } catch (e) { console.warn(e); }
            return st;
        },
        saveNow(state) {
            if (!state) return;
            try {
                localStorage.setItem(PROFILE_KEY(state.id), JSON.stringify(state));
                const idx = readIndex();
                const entry = idx.profiles.find(p => p.id === state.id);
                if (entry) {
                    entry.updated = Date.now(); entry.username = state.username;
                    entry.level = FC.levelFromXp ? FC.levelFromXp(state.xp) : 1;
                    writeIndex(idx);
                }
            } catch (e) { console.warn("No se pudo guardar", e); }
        },
        // Guarda con una pequeña espera para no escribir en cada fotograma.
        save(state) {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => FC.Store.saveNow(state), 250);
        },
        deleteProfile(id) {
            const idx = readIndex();
            idx.profiles = idx.profiles.filter(p => p.id !== id);
            if (idx.active === id) idx.active = idx.profiles[0] ? idx.profiles[0].id : null;
            writeIndex(idx);
            try { localStorage.removeItem(PROFILE_KEY(id)); } catch (e) { /* nada */ }
        },
        // Preferencias que NO son del jugador (no sensibles).
        getPref(k, d) { try { const v = localStorage.getItem("farmcode.pref." + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        setPref(k, v) { try { localStorage.setItem("farmcode.pref." + k, JSON.stringify(v)); } catch (e) { /* nada */ } },

        // Lee el progreso de la demo anterior (si existía) para no perderlo.
        legacy() {
            try {
                const p = JSON.parse(localStorage.getItem("farmCodeDemoProgress") || "null");
                const c = JSON.parse(localStorage.getItem("farmCodeDemoCharacter") || "null");
                if (!p && !c) return null;
                return { xp: (p && Number(p.xp)) || 0, name: (c && c.name) || null };
            } catch (e) { return null; }
        }
    };

    window.addEventListener("beforeunload", () => { if (FC.state) FC.Store.saveNow(FC.state); });
    document.addEventListener("visibilitychange", () => { if (document.hidden && FC.state) FC.Store.saveNow(FC.state); });
})();
