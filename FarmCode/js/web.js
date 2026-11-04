/* ==========================================================
   web.js — Motor de HTML y CSS
   - La vista previa se dibuja en un iframe AISLADO (sandbox sin
     scripts, sin red, sin formularios): el código del jugador no
     puede ejecutar nada ni salir de la ventanita.
   - Para comprobar un ejercicio se dibuja la página en un iframe
     oculto y se examina su estructura real (querySelectorAll) y
     sus estilos reales (getComputedStyle).
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
    const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">`;
    const BASE = `<style>html{font-family:Nunito,'Segoe UI',Arial,sans-serif;color:#222;line-height:1.4}body{margin:0;padding:12px;background:#fff}img{max-width:100%}</style>`;

    // Arma el documento completo que se muestra en la vista previa.
    function buildDoc(lang, code, step) {
        code = String(code || "").slice(0, 20000).replace(/<meta[^>]+http-equiv\s*=\s*["']?refresh[^>]*>/gi, "");
        if (lang === "css") {
            const css = code.replace(/<\/style/gi, "<\\/style");
            return `<!doctype html><html lang="es"><head><meta charset="utf-8">${CSP}${BASE}<style>${css}</style></head><body>${(step && step.html) || ""}</body></html>`;
        }
        if (/<!doctype|<html[\s>]/i.test(code)) {
            if (/<head[^>]*>/i.test(code)) return code.replace(/<head[^>]*>/i, m => m + CSP + BASE);
            if (/<html[^>]*>/i.test(code)) return code.replace(/<html[^>]*>/i, m => m + "<head>" + CSP + BASE + "</head>");
            return CSP + BASE + code;
        }
        return `<!doctype html><html lang="es"><head><meta charset="utf-8">${CSP}${BASE}</head><body>${code}</body></html>`;
    }

    function makePreview() {
        const box = FC.el("div", "preview");
        box.innerHTML = `<div class="preview-bar"><i></i><i></i><i></i><span>mi-pagina.html</span></div>`;
        const ifr = document.createElement("iframe");
        ifr.setAttribute("sandbox", ""); ifr.setAttribute("tabindex", "-1"); ifr.title = "Vista previa de tu página"; ifr.className = "preview-frame";
        box.appendChild(ifr);
        return { box, ifr };
    }
    function show(p, html) { p.ifr.srcdoc = html; }

    function describe(r) {
        if (r.text !== undefined) return `Necesitamos «${r.sel}» con el texto «${r.text}».`;
        if (r.attr) return `Necesitamos «${r.sel}» con ${Object.keys(r.attr).map(k => "«" + k + "»").join(" y ")} bien puesto.`;
        if (r.minLen) return `«${r.sel}» necesita algo más de texto.`;
        return `Falta «${r.sel}» en tu página${(r.min || 1) > 1 ? " (al menos " + r.min + ")" : ""}.`;
    }
    // Pone un valor en un clon del elemento y lo lee ya "calculado": así «red» y «rgb(255, 0, 0)» son iguales.
    function probe(doc, el, prop, value) {
        const p = el.cloneNode(false); p.removeAttribute("style");
        el.parentNode.insertBefore(p, el);
        p.style.setProperty(prop, value, "important");
        const v = doc.defaultView.getComputedStyle(p).getPropertyValue(prop).trim();
        p.remove(); return v;
    }

    async function check(code, spec, step, lang) {
        spec = spec || {}; const msgs = [];
        const clean = FC.stripCode(code, lang);
        (spec.requires || []).forEach(r => { if (!r.re.test(clean)) msgs.push(r.msg); });
        const ifr = document.createElement("iframe");
        ifr.setAttribute("sandbox", "allow-same-origin"); // sin allow-scripts: el código del jugador NO se ejecuta
        ifr.style.cssText = "position:fixed;left:-9999px;top:0;width:640px;height:420px;border:0;visibility:hidden";
        document.body.appendChild(ifr);
        try {
            await new Promise((res, rej) => { ifr.onload = res; ifr.srcdoc = buildDoc(lang, code, step); setTimeout(() => rej(new Error("tiempo")), 4000); });
            const doc = ifr.contentDocument, win = ifr.contentWindow;
            if (!doc || !win) throw new Error("sin acceso");
            (spec.html || []).forEach(r => {
                let els; try { els = [...doc.querySelectorAll(r.sel)]; } catch (e) { els = []; }
                const min = r.min === undefined ? 1 : r.min;
                let pool = els;
                if (r.text !== undefined) pool = pool.filter(e => norm(e.textContent).includes(norm(r.text)));
                if (r.minLen) pool = pool.filter(e => norm(e.textContent).length >= r.minLen);
                if (r.attr) Object.keys(r.attr).forEach(k => { pool = pool.filter(e => { const v = e.getAttribute(k); return v !== null && (r.attr[k] instanceof RegExp ? r.attr[k].test(v) : norm(v) === norm(r.attr[k])); }); });
                if (pool.length < min) msgs.push(r.message || describe(r));
                else if (r.max !== undefined && els.length > r.max) msgs.push(r.message || `Hay demasiados «${r.sel}»: deberían ser ${r.max} como máximo.`);
            });
            (spec.css || []).forEach(r => {
                let el; try { el = doc.querySelector(r.sel); } catch (e) { el = null; }
                if (!el) { msgs.push(r.message || `No encontramos «${r.sel}» en la página.`); return; }
                const got = win.getComputedStyle(el).getPropertyValue(r.prop).trim();
                let ok;
                if (typeof r.value === "function") ok = r.value(got, el, win);
                else ok = (Array.isArray(r.value) ? r.value : [r.value]).some(v => got === probe(doc, el, r.prop, v));
                if (!ok) msgs.push(r.message || `En «${r.sel}», la propiedad «${r.prop}» debería ser ${Array.isArray(r.value) ? r.value.join(" o ") : (typeof r.value === "function" ? "otra cosa" : r.value)}, pero ahora vale ${got || "(nada)"}.`);
            });
            if (spec.custom) { const m = spec.custom({ doc, win, code }); if (m) msgs.push(m); }
        } catch (e) {
            msgs.push("No pudimos comprobar tu página en este navegador. Prueba a recargar el juego.");
        } finally { ifr.remove(); }
        return { ok: msgs.length === 0, res: null, msgs };
    }

    FC.Web = { buildDoc, makePreview, show, check };
})();
