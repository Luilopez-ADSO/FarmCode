/* ==========================================================
   pets.js — La mascota que acompaña al jugador y las reglas
   para desbloquear nuevas mascotas.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const trail = [];
    let lastX = null, lastY = null, idle = 0, animT = 0, face = 1;
    const pet = { x: 140, y: 214 };

    FC.PetCompanion = {
        init(player) { pet.x = player.x - 14; pet.y = player.y + 2; lastX = player.x; lastY = player.y; trail.length = 0; },
        update(dt, pl) {
            if (lastX === null) { lastX = pl.x; lastY = pl.y; }
            if (Math.hypot(pl.x - lastX, pl.y - lastY) >= 2.5) { trail.push({ x: pl.x, y: pl.y }); lastX = pl.x; lastY = pl.y; if (trail.length > 40) trail.shift(); idle = 0; }
            else idle += dt;
            let tx, ty;
            if (idle > 0.4 || trail.length < 8) { tx = pl.x + (pl.dir === "left" ? 13 : -13); ty = pl.y + 3; }
            else { const t = trail[Math.max(0, trail.length - 8)]; tx = t.x; ty = t.y + 1; }
            const dx = tx - pet.x, dy = ty - pet.y, d = Math.hypot(dx, dy);
            let moving = false;
            if (d > 3) {
                const sp = Math.min(d * 5, 92) * dt;
                pet.x += dx / d * Math.min(sp, d); pet.y += dy / d * Math.min(sp, d);
                moving = true; if (Math.abs(dx) > 1) face = dx > 0 ? 1 : -1;
            }
            if (d > 90) { pet.x = pl.x - 14; pet.y = pl.y + 2; }
            animT = moving ? animT + dt * 8 : 0;
            pet.frame = Math.floor(animT) % 2;
        },
        y() { return pet.y; },
        draw(ctx) {
            const type = FC.state.pets.active; if (!type) return;
            const f = FC.Sprites.pet(type)[pet.frame || 0];
            const x = Math.round(pet.x), y = Math.round(pet.y);
            ctx.save();
            if (face < 0) { ctx.translate(x + 12, y - 16); ctx.scale(-1, 1); ctx.drawImage(f, 0, 0); }
            else ctx.drawImage(f, x - 12, y - 16);
            ctx.restore();
        }
    };

    /* ---------- Desbloqueo de mascotas ---------- */
    FC.Pets = {
        isUnlocked: id => FC.state.pets.unlocked.includes(id),
        // Comprueba si alguna mascota nueva debe desbloquearse (por nivel o lección).
        check() {
            const st = FC.state;
            FC.PET_ORDER.forEach(id => {
                const def = FC.PETS[id];
                if (st.pets.unlocked.includes(id)) return;
                let ok = false;
                if (def.unlock.type === "level") ok = FC.levelFromXp(st.xp) >= def.unlock.value;
                if (def.unlock.type === "lesson") ok = !!(st.lessons[def.unlock.value] && st.lessons[def.unlock.value].done);
                if (ok) {
                    st.pets.unlocked.push(id);
                    FC.Store.save(st);
                    FC.bus.emit("pet", { id });
                    FC.UI.popup({ icon: "paw", title: "¡Nueva mascota!", body: `${def.name}, ${def.kind.toLowerCase()}, quiere acompañarte. Puedes elegirla en «Mis mascotas».`, button: "¡Genial!" });
                }
            });
        },
        select(id) {
            if (!FC.Pets.isUnlocked(id)) return false;
            FC.state.pets.active = id; FC.Store.save(FC.state); return true;
        }
    };
})();
