/* ==========================================================
   community.js — Pantalla «Comunidad»
   IMPORTANTE: la comunidad real (perfiles públicos de otros
   jugadores, publicaciones, comentarios) necesita un servidor y
   una base de datos. Todavía no existe, así que esta pantalla
   NO finge nada: muestra tu perfil público con tus datos reales
   y explica qué falta.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const el = (t, c, h) => FC.el(t, c, h), esc = FC.esc, ico = (n, s) => FC.Sprites.iconHtml(n, s);

    FC.Panels.community = {
        title: "Comunidad", icon: "people",
        render(body) {
            const st = FC.state, L = FC.levelFromXp(st.xp);
            const earned = FC.ACHIEVEMENTS.filter(a => st.achievements[a.id]).slice(0, 4);
            const since = new Date(st.createdAt).toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" });
            const avatarUrl = FC.Sprites.charPreview(st.avatar, "down").toDataURL();
            body.innerHTML = `
              <div class="card community-soon"><div class="row">${ico("people", 48)}<div style="flex:1;min-width:220px"><b style="font:400 12px/1.6 var(--font-px)">Muy pronto</b>
                <p style="margin:6px 0 0;font-size:16px;line-height:1.5">La comunidad conecta a jugadores con cuentas reales, y eso necesita un servidor. Todavía no está activo, así que por ahora no hay otros jugadores ni publicaciones. Aquí tienes cómo será tu perfil.</p></div></div></div>
              <h2 class="sect">Tu perfil público (vista previa)</h2>
              <div class="card profile-card"><img class="profile-avatar" alt="Tu personaje" src="${avatarUrl}">
                <div style="flex:1;min-width:200px"><div style="font:400 14px/1.5 var(--font-px);color:var(--wood-d)">${esc(st.username)}</div>
                  <div class="row" style="margin-top:6px"><span class="chip gold">${ico("star", 14)}Nivel ${L}</span><span class="chip">${st.xp} XP</span><span class="chip">Se unió el ${esc(since)}</span></div>
                  <div style="margin-top:8px;font-weight:800">Logros destacados</div>
                  <div class="row" style="gap:6px;margin-top:4px">${earned.length ? earned.map(a => `<span class="chip green">${ico(a.icon, 14)}${esc(a.name)}</span>`).join("") : `<span class="muted">Aún no tienes logros. ¡Juega para conseguirlos!</span>`}</div>
                  <p class="muted" style="margin:10px 0 0;font-size:14px">Los demás verán solo esto. Tu correo y tus datos privados nunca se mostrarán.</p></div></div>
              <h2 class="sect">Lo que podrás hacer</h2>
              <div class="grid c2">
                <div class="card"><b>Perfiles y búsqueda</b><p style="margin:6px 0 0">Buscar jugadores por su nombre de usuario único y visitar sus perfiles.</p></div>
                <div class="card"><b>Publicaciones</b><p style="margin:6px 0 0">Compartir una cosecha, un logro, cómo resolviste un ejercicio o hacer preguntas sobre una lección.</p></div>
                <div class="card"><b>Reacciones y comentarios</b><p style="margin:6px 0 0">Dar «me gusta» y comentar las publicaciones de otras personas.</p></div>
                <div class="card"><b>Seguridad primero</b><p style="margin:6px 0 0">Reportar contenido, límites contra el spam, textos limpiados de código malicioso y permisos revisados en el servidor.</p></div></div>
              <h2 class="sect">¿Qué falta para activarla?</h2>
              <div class="card"><p style="margin:0 0 8px">Un servidor (backend) con base de datos, cuentas con contraseñas cifradas y sesiones seguras. Cuando exista, esta pantalla se conectará a él y todo lo anterior funcionará de verdad. No se simula con datos locales porque no serviría para conectar a personas distintas.</p></div>`;
        }
    };
})();
