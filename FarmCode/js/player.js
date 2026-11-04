/* ==========================================================
   player.js — El personaje: movimiento, colisiones y animación
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const HB_W = 10, HB_H = 6;           // caja de colisión en los pies
    const SPEED = 70, RUN = 1.55;        // píxeles del mundo por segundo

    const P = (FC.Player = {
        x: 150, y: 214, dir: "down", moving: false, animT: 0, frame: 0, actT: -1, steps: 0,
        init(st) {
            P.x = st.player.x; P.y = st.player.y; P.dir = st.player.dir || "down";
            // Si el guardado quedó dentro de un objeto, vuelve al punto de inicio.
            if (FC.Map.collides(P.x - HB_W / 2, P.y - HB_H, HB_W, HB_H)) { const sp = (FC.Map.current && FC.Map.current.spawn) || { x: 150, y: 214 }; P.x = sp.x; P.y = sp.y; }
        },
        // dx, dy: dirección deseada (-1, 0, 1). run: true si corre.
        update(dt, dx, dy, run) {
            if (P.actT >= 0) { P.actT += dt; if (P.actT > 0.4) P.actT = -1; dx = dy = 0; }
            P.moving = false;
            if (dx || dy) {
                if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
                const sp = SPEED * (run ? RUN : 1) * dt;
                const nx = P.x + dx * sp, ny = P.y + dy * sp;
                let moved = false;
                if (!FC.Map.collides(nx - HB_W / 2, P.y - HB_H, HB_W, HB_H)) { P.x = nx; moved = true; }
                if (!FC.Map.collides(P.x - HB_W / 2, ny - HB_H, HB_W, HB_H)) { P.y = ny; moved = true; }
                if (Math.abs(dx) > Math.abs(dy)) P.dir = dx < 0 ? "left" : "right";
                else if (dy) P.dir = dy < 0 ? "up" : "down";
                P.moving = moved;
            }
            if (P.moving) { P.animT += dt * (run ? 1.5 : 1); P.frame = Math.floor(P.animT * 8) % 4; }
            else { P.animT = 0; P.frame = 0; }
        },
        // Pequeña animación de usar la herramienta.
        act() { if (P.actT < 0) P.actT = 0; },
        // Punto justo delante del personaje (para elegir con qué interactuar).
        facePoint(dist) {
            const d = dist || 11, v = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[P.dir];
            return { x: P.x + v[0] * d, y: P.y - 4 + v[1] * d };
        },
        save() { const s = FC.state; if (s) { s.player.x = Math.round(P.x); s.player.y = Math.round(P.y); s.player.dir = P.dir; } },
        draw(ctx) {
            const a = FC.state.avatar, sheet = FC.Sprites.charSheet(a), C = FC.Sprites.CHAR;
            const row = { down: 0, left: 1, right: 2, up: 3 }[P.dir];
            let col = P.frame, r = row;
            if (P.actT >= 0) { r = row + 4; col = Math.min(3, Math.floor(P.actT / 0.1)); }
            // sombra
            ctx.fillStyle = "rgba(0,0,0,.22)";
            ctx.fillRect(Math.round(P.x) - 5, Math.round(P.y) - 2, 10, 3); ctx.fillRect(Math.round(P.x) - 4, Math.round(P.y) - 3, 8, 1);
            ctx.drawImage(sheet, col * C.w, r * C.h, C.w, C.h, Math.round(P.x) - C.footX, Math.round(P.y) - C.footY, C.w, C.h);
        }
    });
})();
