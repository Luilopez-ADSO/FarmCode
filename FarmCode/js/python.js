/* ==========================================================
   python.js — Ejecuta el código de los jugadores.
   Motor 1 (siempre disponible): intérprete propio (pyinterp.js).
       Rápido, seguro, sin internet, con límite de pasos.
   Motor 2 (respaldo): Pyodide = Python completo en el navegador.
       Solo se descarga si el código usa algo que el motor 1 no
       entiende. Corre en un Web Worker con límite de tiempo, así
       un ciclo infinito no congela el juego.
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});
    const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
    const RUN_TIMEOUT = 4000, LOAD_TIMEOUT = 30000;

    const HELPER = `
import sys, io, json
def __fc_run(src):
    out = io.StringIO()
    ns = {"__name__": "__main__"}
    err = None
    old = sys.stdout
    sys.stdout = out
    try:
        exec(compile(src, "<farmcode>", "exec"), ns)
    except SyntaxError as e:
        err = {"type": type(e).__name__, "message": str(e.msg), "line": e.lineno}
    except BaseException as e:
        line = None
        tb = e.__traceback__
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == "<farmcode>":
                line = tb.tb_lineno
            tb = tb.tb_next
        err = {"type": type(e).__name__, "message": str(e), "line": line}
    finally:
        sys.stdout = old
    vs = {}
    for k, v in list(ns.items()):
        if k.startswith("_"):
            continue
        t = type(v).__name__
        if t in ("int", "float", "str", "bool", "list", "NoneType"):
            try:
                json.dumps(v)
                vs[k] = {"type": t, "value": v, "repr": repr(v)}
            except Exception:
                pass
        elif t == "function":
            vs[k] = {"type": "function", "value": None, "repr": repr(v)}
    return json.dumps({"stdout": out.getvalue(), "vars": vs, "error": err})
`;
    const WORKER_SRC = `
let py = null;
self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === "init") {
    try {
      importScripts(m.url + "pyodide.js");
      py = await loadPyodide({ indexURL: m.url });
      py.runPython(m.helper);
      self.postMessage({ type: "ready" });
    } catch (err) { self.postMessage({ type: "fail", msg: String(err) }); }
  } else if (m.type === "run") {
    try {
      const fn = py.globals.get("__fc_run");
      const json = fn(m.code); fn.destroy && fn.destroy();
      self.postMessage({ type: "result", id: m.id, json });
    } catch (err) { self.postMessage({ type: "result", id: m.id, json: JSON.stringify({ stdout: "", vars: {}, error: { type: "RuntimeError", message: String(err), line: null } }) }); }
  }
};`;

    let worker = null, status = "idle", readyWaiters = [], pending = {}, idSeq = 0;

    function startWorker() {
        if (status === "loading" || status === "ready") return;
        status = "loading";
        try {
            const blob = new Blob([WORKER_SRC], { type: "text/javascript" });
            worker = new Worker(URL.createObjectURL(blob));
        } catch (e) { status = "failed"; flushWaiters(false); return; }
        const t = setTimeout(() => { if (status === "loading") { killWorker("failed"); flushWaiters(false); } }, LOAD_TIMEOUT);
        worker.onmessage = e => {
            const m = e.data;
            if (m.type === "ready") { clearTimeout(t); status = "ready"; flushWaiters(true); }
            else if (m.type === "fail") { clearTimeout(t); killWorker("failed"); flushWaiters(false); }
            else if (m.type === "result" && pending[m.id]) { const p = pending[m.id]; delete pending[m.id]; clearTimeout(p.timer); p.resolve(m.json); }
        };
        worker.onerror = () => { clearTimeout(t); if (status === "loading") { killWorker("failed"); flushWaiters(false); } };
        worker.postMessage({ type: "init", url: PYODIDE_URL, helper: HELPER });
    }
    function killWorker(newStatus) {
        if (worker) { try { worker.terminate(); } catch (e) { /* nada */ } }
        worker = null; status = newStatus;
        Object.keys(pending).forEach(k => { clearTimeout(pending[k].timer); pending[k].resolve(null); delete pending[k]; });
    }
    function flushWaiters(ok) { const w = readyWaiters; readyWaiters = []; w.forEach(f => f(ok)); }
    function waitReady() {
        if (status === "ready") return Promise.resolve(true);
        if (status === "failed") { status = "idle"; }
        return new Promise(res => { readyWaiters.push(res); startWorker(); });
    }
    function runPyodide(code) {
        return new Promise(resolve => {
            const id = ++idSeq;
            const timer = setTimeout(() => {
                // Ciclo infinito: se corta el trabajador y se vuelve a preparar en segundo plano.
                killWorker("idle");
                resolve("TIMEOUT");
            }, RUN_TIMEOUT);
            pending[id] = { resolve, timer };
            worker.postMessage({ type: "run", id, code });
        });
    }

    /* ---------- Mensajes de error en lenguaje sencillo ---------- */
    function friendly(err, code) {
        if (!err) return "";
        const t = err.type, m = err.message || "";
        const where = err.line ? ` (línea ${err.line})` : "";
        if (t === "TimeoutError") return "Tu programa tardó demasiado en terminar. ¿Tienes un ciclo que nunca acaba? Revisa que la condición del while llegue a ser falsa algún día.";
        if (t === "RecursionError") return "Una función se llama a sí misma sin parar. Revisa que tenga un punto donde se detenga.";
        if (t === "IndentationError") return `Algo anda mal con la sangría${where}. Las líneas que van dentro de un if, for, while o def deben empezar con 4 espacios, y todas las del mismo bloque con los mismos espacios.`;
        if (t === "SyntaxError") {
            if (/invalid character/.test(m) && /[\u201C\u201D\u2018\u2019]/.test(m)) return `Usaste comillas curvas${where}. En Python se usan comillas rectas: " o '.`;
            if (/never closed|was never closed/.test(m)) return `Falta cerrar un paréntesis o corchete${where}.`;
            if (/unterminated string|EOL while scanning/.test(m)) return `Falta cerrar unas comillas${where}.`;
            if (/expected ':'/.test(m)) return `Falta el signo de dos puntos (:) al final de la línea${where}.`;
            if (/cannot assign|Maybe you meant '=='/.test(m)) return `Para guardar un valor se escribe  nombre = valor.  Para comparar dos cosas se usa == ${where}.`;
            if (/expected an indented block/.test(m)) return `Después de los dos puntos (:) la siguiente línea debe tener sangría de 4 espacios${where}.`;
            return `Python no entendió esta línea${where}. Revisa que no falten comillas, paréntesis o dos puntos (:), y que las palabras estén bien escritas.`;
        }
        if (t === "NameError") {
            const nm = (/'([^']+)'/.exec(m) || [])[1];
            return `Python no conoce el nombre «${nm || "?"}»${where}. Revisa que lo hayas escrito igual que cuando lo creaste (las mayúsculas y las tildes cuentan) y que lo hayas creado antes de usarlo. Si es un texto, ponlo entre comillas.`;
        }
        if (t === "TypeError") {
            if (/concatenate|unsupported operand/.test(m)) return `Estás mezclando tipos de datos distintos${where}, por ejemplo un texto con un número. Convierte el número a texto con str(...) o usa una coma dentro de print.`;
            if (/missing .* required positional argument/.test(m)) return `Llamaste a una función sin darle todos los datos que necesita${where}.`;
            if (/positional argument/.test(m)) return `Le diste a la función más datos de los que espera${where}.`;
            if (/not callable/.test(m)) return `Intentaste usar como función algo que no lo es${where}. ¿Falta un signo como + o = antes del paréntesis?`;
            return `Hay un problema con los tipos de datos${where}: ${m}`;
        }
        if (t === "ZeroDivisionError") return `No se puede dividir entre cero${where}.`;
        if (t === "ValueError") return `Ese valor no se pudo convertir${where}. Revisa que el texto realmente sea un número.`;
        if (t === "IndexError") return `Pediste una posición que no existe en la lista${where}. Recuerda que se empieza a contar desde 0.`;
        if (t === "Unsupported") return `Esta parte de Python («${m}») todavía no la entiende el simulador del juego, y no se pudo cargar Python completo (¿sin internet?). Prueba con una forma más sencilla.`;
        return `Python encontró un problema${where}: ${m}`;
    }

    /* ---------- API pública ---------- */
    FC.Py = {
        friendly,
        status: () => status,
        // Ejecuta código y devuelve una promesa con {ok, stdout, vars, error, engine}
        async run(code, opts) {
            opts = opts || {};
            if (typeof code !== "string") code = "";
            if (code.length > 20000) return { ok: false, stdout: "", vars: {}, engine: "none", error: { type: "RuntimeError", message: "demasiado largo", line: null, friendly: "Tu programa es demasiado largo para este simulador." } };
            let r = FC.PyInterp.run(code);
            if (r.unsupported && !opts.noFallback) {
                if (opts.onStatus) opts.onStatus("Esta parte necesita Python completo. Preparándolo…");
                const ok = await waitReady();
                if (ok) {
                    const json = await runPyodide(code);
                    if (json === "TIMEOUT") r = { ok: false, stdout: "", vars: {}, engine: "pyodide", error: { type: "TimeoutError", message: "timeout", line: null } };
                    else if (json) { const o = JSON.parse(json); r = { ok: !o.error, stdout: o.stdout, vars: o.vars, error: o.error, engine: "pyodide" }; }
                }
            }
            if (r.error) r.error.friendly = friendly(r.error, code);
            r.ok = !r.error;
            return r;
        }
    };
})();
