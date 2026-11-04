/* ==========================================================
   main.js — Arranque de Farm Code
   ========================================================== */
(function () {
    const FC = window.FC;
    function boot() {
        let st = FC.Store.loadActive();
        const firstTime = !st;
        if (!st) {
            st = FC.Store.createProfile("Granjero");
            const old = FC.Store.legacy();
            if (old) { st.xp = Math.max(0, Math.min(old.xp, 400)); if (old.name) { st.avatar.name = old.name.slice(0, 16); st.username = st.avatar.name; } }
        }
        FC.state = st;
        FC.Sprites.charSheet(st.avatar);
        document.getElementById("hud-coin-ico").src = FC.Sprites.icon("coin");
        FC.UI.init();
        FC.Game.init();
        FC.Missions.refresh();
        FC.Pets.check();
        FC.Achievements.check();
        FC.UI.updateHud();
        if (firstTime || !st.flags.welcomed) FC.Welcome && FC.Welcome.show();
        else FC.UI.toast(`¡Hola de nuevo, ${st.avatar.name}!`, "heart");
    }
    document.addEventListener("DOMContentLoaded", boot);
})();
