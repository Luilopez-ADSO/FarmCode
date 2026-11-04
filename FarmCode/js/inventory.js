/* ==========================================================
   inventory.js — Inventario, tienda (compra/venta) y monedas
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const inv = () => FC.state.inv;
    const save = () => { FC.Store.save(FC.state); FC.bus.emit("inventory"); };

    FC.Inventory = {
        seeds: id => inv().seeds[id] || 0,
        crops: id => inv().crops[id] || 0,
        totalSeeds() { return Object.values(inv().seeds).reduce((a, b) => a + b, 0); },
        addSeeds(id, n) { inv().seeds[id] = (inv().seeds[id] || 0) + n; save(); },
        useSeed(id) { if (this.seeds(id) < 1) return false; inv().seeds[id]--; save(); return true; },
        addCrop(id, n) { inv().crops[id] = (inv().crops[id] || 0) + n; save(); },
        addSpecial(id) { inv().special[id] = (inv().special[id] || 0) + 1; save(); },
        // Elige una semilla distinta si la actual se acabó.
        ensureSelected() {
            const st = FC.state;
            if (this.seeds(st.selectedSeed) > 0) return;
            const other = FC.CROP_ORDER.find(id => this.seeds(id) > 0);
            if (other) st.selectedSeed = other;
        },
        select(id) { if (FC.CROPS[id]) { FC.state.selectedSeed = id; FC.Store.save(FC.state); FC.bus.emit("inventory"); } },

        canBuy(id) { return FC.levelFromXp(FC.state.xp) >= FC.CROPS[id].minLevel; },
        buySeed(id, qty) {
            const c = FC.CROPS[id], st = FC.state;
            qty = Math.max(1, qty | 0);
            if (!this.canBuy(id)) return { ok: false, msg: `Esta semilla se desbloquea en el nivel ${c.minLevel}.` };
            const cost = c.buy * qty;
            if (st.coins < cost) return { ok: false, msg: "No tienes suficientes monedas." };
            st.coins -= cost; inv().seeds[id] = (inv().seeds[id] || 0) + qty; save();
            return { ok: true, msg: `Compraste ${qty} semilla${qty > 1 ? "s" : ""} de ${c.name.toLowerCase()}.` };
        },
        sellCrop(id, qty) {
            const c = FC.CROPS[id], st = FC.state;
            qty = Math.min(Math.max(1, qty | 0), this.crops(id));
            if (qty < 1) return { ok: false, msg: "No tienes nada para vender." };
            inv().crops[id] -= qty;
            const gain = c.sell * qty;
            st.coins += gain; st.stats.coinsEarned += gain; st.stats.sold += qty;
            save();
            FC.event("sell", { amount: qty, crop: id });
            return { ok: true, gain, qty, msg: `Vendiste ${qty} ${qty > 1 ? c.plural : c.name.toLowerCase()} por ${gain} monedas.` };
        }
    };
})();
