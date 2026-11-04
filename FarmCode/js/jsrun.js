/* ==========================================================
   jsrun.js — Ejecuta el JavaScript de los jugadores
   El código corre en un Web Worker (sin acceso a la página), con
   la red desactivada y un límite de tiempo: un ciclo infinito se
   corta y NO congela el juego. console.log se captura como la
   «salida» del programa, igual que print en Python.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const TIMEOUT = 2000;

    const WORKER_SRC = `
const _pm = self.postMessage.bind(self);
const post = (m) => _pm(m);
for (const k of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches", "Worker", "SharedWorker", "BroadcastChannel", "postMessage"]) { try { self[k] = undefined; } catch (e) {} }
const fmt = (v, inner) => {
  if (typeof v === "string") return inner ? "'" + v + "'" : v;
  if (typeof v === "number") return Object.is(v, -0) ? "-0" : String(v);
  if (typeof v === "bigint") return v + "n";
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "boolean") return String(v);
  if (typeof v === "function") return "[Function: " + (v.name || "(anonymous)") + "]";
  if (Array.isArray(v)) return v.length ? "[ " + v.map(x => fmt(x, true)).join(", ") + " ]" : "[]";
  if (typeof v === "object") { try { const k = Object.keys(v); return k.length ? "{ " + k.map(a => a + ": " + fmt(v[a], true)).join(", ") + " }" : "{}"; } catch (e) { return "[Object]"; } }
  return String(v);
};
const kind = (v) => v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "object" ? "object" : typeof v;
self.onmessage = (e) => {
  const { code, names } = e.data;
  const out = []; let len = 0;
  const log = (...a) => { const line = a.map(x => fmt(x, false)).join(" "); len += line.length + 1; if (len > 20000) throw new Error("El programa escribió demasiado texto."); out.push(line); };
  const cons = { log, info: log, warn: log, error: log, debug: log };
  const alertFn = (...a) => log("[alerta]", ...a);
  const promptFn = () => { throw new Error("prompt() no está disponible en este simulador. Escribe los valores directamente en el código."); };
  let vars = {}, error = null;
  const cap = (getter) => {
    const o = getter();
    for (const k of Object.keys(o)) {
      const v = o[k], t = kind(v);
      let value = null;
      if (t === "number") value = Number.isFinite(v) ? v : null;
      else if (t === "string" || t === "boolean") value = v;
      else if (t === "array") { try { value = JSON.parse(JSON.stringify(v)); } catch (e) { value = null; } }
      vars[k] = { type: t, value, repr: fmt(v, true) };
    }
  };
  try {
    const body = "try {\\n" + code + "\\n;__cap(function(){var o={};" + names.map(n => "try{o[" + JSON.stringify(n) + "]=" + n + "}catch(e){}").join(";") + ";return o;});\\n} finally {}";
    const fn = new Function("console", "alert", "prompt", "__cap", body);
    fn(cons, alertFn, promptFn, cap);
  } catch (err) {
    let line = null; const m = /<anonymous>:(\\d+):\\d+/.exec(String(err && err.stack || ""));
    if (m) line = Math.max(1, Number(m[1]) - 3);
    error = { type: (err && err.name) || "Error", message: String((err && err.message) || err), line };
  }
  post({ out: out.join("\\n") + (out.length ? "\\n" : ""), vars, error });
};`;
    let blobUrl = null;
    const url = () => blobUrl || (blobUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" })));

    // Nombres de variables y funciones declaradas al nivel principal (para mostrarlas en el escenario)
    function declared(code) {
        const clean = FC.stripCode(code, "js"), names = new Set();
        let m; const re1 = /\b(?:let|const|var)\s+([A-Za-z_$][\w$]*)/g, re2 = /\bfunction\s+([A-Za-z_$][\w$]*)/g;
        while ((m = re1.exec(clean))) names.add(m[1]);
        while ((m = re2.exec(clean))) names.add(m[1]);
        return [...names];
    }

    function friendly(err) {
        if (!err) return "";
        const t = err.type, m = err.message || "", where = err.line ? ` (línea ${err.line})` : "";
        if (t === "TimeoutError") return "Tu programa tardó demasiado en terminar. ¿Tienes un ciclo que nunca acaba? Revisa que la condición llegue a ser falsa algún día.";
        if (t === "ReferenceError") {
            const nm = (/^(.+?) is not defined/.exec(m) || [])[1];
            return `JavaScript no conoce el nombre «${nm || "?"}»${where}. Revisa que lo hayas escrito igual que cuando lo creaste (las mayúsculas cuentan) y que lo hayas creado antes de usarlo. Si es un texto, ponlo entre comillas.`;
        }
        if (t === "SyntaxError") {
            if (/Unexpected end of input|missing \)|Unexpected token '\)'/.test(m)) return `Falta cerrar un paréntesis, una llave o unas comillas${where}. Revisa que cada ( { [ tenga su pareja.`;
            if (/Invalid or unexpected token|Unexpected string/.test(m)) return `Hay unas comillas o un símbolo raro${where}. Revisa que los textos tengan comillas rectas al inicio y al final.`;
            if (/already been declared/.test(m)) return `Declaraste la misma variable dos veces con let o const${where}. Solo se declara una vez; después se cambia con =.`;
            return `JavaScript no entendió esta parte${where}. Revisa llaves { }, paréntesis ( ), comillas y punto y coma (;).`;
        }
        if (t === "TypeError") {
            if (/Assignment to constant/.test(m)) return `Intentaste cambiar una variable creada con const${where}. Usa let si su valor debe cambiar.`;
            if (/is not a function/.test(m)) return `Intentaste usar como función algo que no lo es${where}. Revisa el nombre y los paréntesis.`;
            if (/Cannot read propert/.test(m)) return `Intentaste mirar dentro de algo que no existe todavía (undefined)${where}.`;
            return `Hay un problema con los tipos de datos${where}: ${m}`;
        }
        if (t === "RangeError") return /call stack/.test(m) ? "Una función se llama a sí misma sin parar. Revisa que tenga un punto donde se detenga." : `Un número está fuera de rango${where}.`;
        return `JavaScript encontró un problema${where}: ${m}`;
    }

    FC.JSRun = {
        friendly,
        run(code) {
            code = String(code || "");
            return new Promise(resolve => {
                if (code.length > 20000) return resolve({ ok: false, engine: "js", stdout: "", vars: {}, error: { type: "RuntimeError", message: "demasiado largo", line: null, friendly: "Tu programa es demasiado largo para este simulador." } });
                let w;
                try { w = new Worker(url()); } catch (e) {
                    return resolve({ ok: false, engine: "js", stdout: "", vars: {}, error: { type: "RuntimeError", message: "sin worker", line: null, friendly: "Este navegador no puede ejecutar JavaScript de forma segura aquí." } });
                }
                const finish = res => { clearTimeout(timer); try { w.terminate(); } catch (e) { /* nada */ } if (res.error) res.error.friendly = friendly(res.error); res.ok = !res.error; res.engine = "js"; resolve(res); };
                const timer = setTimeout(() => finish({ stdout: "", vars: {}, error: { type: "TimeoutError", message: "timeout", line: null } }), TIMEOUT);
                w.onmessage = e => finish({ stdout: e.data.out, vars: e.data.vars || {}, error: e.data.error });
                w.onerror = ev => { ev.preventDefault && ev.preventDefault(); finish({ stdout: "", vars: {}, error: { type: "Error", message: String(ev.message || "error"), line: null } }); };
                w.postMessage({ code, names: declared(code) });
            });
        }
    };
})();
