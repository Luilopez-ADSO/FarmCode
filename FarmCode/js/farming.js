/* ==========================================================
   farming.js — Parcelas, siembra, riego y cosecha
   El crecimiento se mide con la hora real (Date.now), así las
   plantas siguen creciendo aunque cierres el juego.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});

    const F = (FC.Farming = {
        // Estado calculado de una parcela.
        info(plotId) {
            const p = FC.state.plots[plotId];
            if (!p) return { empty: true };
            const c = FC.CROPS[p.crop], now = Date.now();
            const total = Math.max(1, p.readyAt - p.plantedAt);
            const progress = Math.min(1, Math.max(0, (now - p.plantedAt) / total));
            const ready = now >= p.readyAt;
            const stage = ready ? 3 : progress < 0.3 ? 0 : progress < 0.65 ? 1 : 2;
            return { empty: false, crop: p.crop, def: c, progress, ready, stage, watered: !!p.watered, remainingSec: Math.max(0, Math.ceil((p.readyAt - now) / 1000)) };
        },
        isUnlocked(plot) { return !plot.advanced || FC.state.flags.gateOpen; },

        plant(plotId, cropId) {
            const st = FC.state;
            if (st.plots[plotId]) return { ok: false, msg: "Aquí ya hay una planta." };
            const c = FC.CROPS[cropId];
            if (!c) return { ok: false, msg: "Elige una semilla." };
            if (!FC.Inventory.useSeed(cropId)) return { ok: false, msg: `No tienes semillas de ${c.name.toLowerCase()}. Puedes comprarlas en el mercado.` };
            const now = Date.now();
            st.plots[plotId] = { crop: cropId, plantedAt: now, readyAt: now + c.growSec * 1000, watered: false };
            st.stats.planted++;
            FC.Inventory.ensureSelected();
            FC.Store.save(st);
            FC.event("plant", { crop: cropId, plot: plotId });
            return { ok: true, msg: `Sembraste ${c.name.toLowerCase()}.` };
        },
        water(plotId) {
            const st = FC.state, p = st.plots[plotId];
            if (!p) return { ok: false, msg: "No hay nada que regar aquí." };
            const inf = F.info(plotId);
            if (inf.ready) return { ok: false, msg: "¡Ya está lista! Puedes cosecharla." };
            if (p.watered) return { ok: false, msg: "Esta planta ya tiene agua. Espera a que crezca." };
            const now = Date.now(), remaining = p.readyAt - now;
            p.readyAt = now + remaining * (1 - FC.CROPS[p.crop].waterBoost);
            p.watered = true;
            st.stats.watered++;
            FC.Store.save(st);
            FC.event("water", { plot: plotId });
            return { ok: true, msg: "¡Regada! Crecerá más rápido y dará más cosecha." };
        },
        harvest(plotId) {
            const st = FC.state, p = st.plots[plotId];
            if (!p) return { ok: false, msg: "No hay nada que cosechar." };
            const inf = F.info(plotId);
            if (!inf.ready) return { ok: false, msg: `Todavía no está lista. Faltan unos ${inf.remainingSec} s.` };
            // Se borra la parcela ANTES de dar el premio: así no se puede cosechar dos veces.
            delete st.plots[plotId];
            const c = FC.CROPS[p.crop], amount = 1 + (p.watered ? 1 : 0);
            st.stats.harvested += 1;
            FC.Inventory.addCrop(p.crop, amount);
            FC.Store.save(st);
            FC.Progress.addXp(c.xp, "harvest");
            FC.event("harvest", { crop: p.crop, plot: plotId, amount: 1, quantity: amount });
            return { ok: true, crop: p.crop, amount, xp: c.xp, msg: `+${amount} ${amount > 1 ? c.plural : c.name.toLowerCase()}` };
        }
    });
})();
