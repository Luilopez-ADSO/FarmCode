/* ==========================================================
   pyinterp.js — Un pequeño intérprete de Python escrito en JavaScript.
   Entiende lo que se enseña en el tutorial: variables, tipos,
   operaciones, if/elif/else, for, while, funciones, listas, f-strings
   y varias funciones/métodos comunes.
   - Se ejecuta de verdad (no busca palabras con regex).
   - Tiene un límite de pasos: un ciclo infinito NO bloquea la página.
   - Si el código usa algo que no soporta, lanza «unsupported» y
     python.js lo intenta con Pyodide (Python completo).
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});

    class PyError extends Error { constructor(type, msg, line) { super(msg); this.pyType = type; this.line = line || null; } }
    class PyUnsupported extends Error { constructor(what, line) { super(what); this.line = line || null; } }
    class PyFloat { constructor(v) { this.v = v; } }
    class PyTuple { constructor(items) { this.items = items; } }
    class PyFunc { constructor(name, params, body, env) { this.name = name; this.params = params; this.body = body; this.env = env; } }
    class PyType { constructor(n) { this.n = n; } }
    class Brk { } class Cont { } class Ret { constructor(v) { this.v = v; } }

    const isInt = x => typeof x === "number";
    const isFloat = x => x instanceof PyFloat;
    const isNum = x => isInt(x) || isFloat(x);
    const isStr = x => typeof x === "string";
    const isBool = x => typeof x === "boolean";
    const isList = x => Array.isArray(x);
    const num = x => (isFloat(x) ? x.v : isBool(x) ? (x ? 1 : 0) : x);
    const tname = x => isBool(x) ? "bool" : isInt(x) ? "int" : isFloat(x) ? "float" : isStr(x) ? "str" : isList(x) ? "list" : x instanceof PyTuple ? "tuple" : x === null ? "NoneType" : x instanceof PyFunc || (typeof x === "function") ? "function" : "object";

    /* ---------- Texto de los valores ---------- */
    function fmtFloat(v) {
        if (Number.isNaN(v)) return "nan";
        if (!Number.isFinite(v)) return v > 0 ? "inf" : "-inf";
        if (v === 0) return Object.is(v, -0) ? "-0.0" : "0.0";
        const a = Math.abs(v);
        if (a >= 1e16 || a < 1e-4) return v.toExponential().replace(/e([+-])(\d)$/, "e$10$2");
        if (Number.isInteger(v)) return v.toFixed(1);
        return String(v);
    }
    function reprStr(s) {
        const q = s.includes("'") && !s.includes('"') ? '"' : "'";
        let out = "";
        for (const ch of s) {
            if (ch === "\\") out += "\\\\"; else if (ch === "\n") out += "\\n"; else if (ch === "\t") out += "\\t"; else if (ch === q) out += "\\" + q; else out += ch;
        }
        return q + out + q;
    }
    function repr(x) {
        if (x === null) return "None";
        if (isBool(x)) return x ? "True" : "False";
        if (isInt(x)) return String(x);
        if (isFloat(x)) return fmtFloat(x.v);
        if (isStr(x)) return reprStr(x);
        if (isList(x)) return "[" + x.map(repr).join(", ") + "]";
        if (x instanceof PyTuple) return "(" + x.items.map(repr).join(", ") + (x.items.length === 1 ? ",)" : ")");
        if (x instanceof PyFunc) return `<function ${x.name}>`;
        if (x instanceof PyType) return `<class '${x.n}'>`;
        return "<built-in function>";
    }
    const str = x => (isStr(x) ? x : repr(x));
    const truthy = x => !(x === null || x === false || x === 0 || x === "" || (isFloat(x) && x.v === 0) || (isList(x) && !x.length) || (x instanceof PyTuple && !x.items.length));

    /* ---------- Tokenizador ---------- */
    const OPS3 = ["**=", "//=", "..."];
    const OPS2 = ["**", "//", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=", "->"];
    const OPS1 = "+-*/%()[]{},:.=<>!@;";
    function tokenize(src) {
        src = src.replace(/\r\n?/g, "\n").replace(/\t/g, "    ");
        const toks = []; let i = 0, line = 1, depth = 0, atLineStart = true; const indents = [0];
        const push = (t, v) => toks.push({ t, v, line });
        while (i < src.length) {
            if (atLineStart && depth === 0) {
                let j = i, col = 0;
                while (src[j] === " ") { col++; j++; }
                if (src[j] === "\n" || src[j] === "#" || j >= src.length) { // línea vacía o comentario
                    while (j < src.length && src[j] !== "\n") j++;
                    i = j + 1; line++; continue;
                }
                if (col > indents[indents.length - 1]) { indents.push(col); push("INDENT"); }
                else if (col < indents[indents.length - 1]) {
                    while (col < indents[indents.length - 1]) { indents.pop(); push("DEDENT"); }
                    if (col !== indents[indents.length - 1]) throw new PyError("IndentationError", "unindent does not match any outer indentation level", line);
                }
                i = j; atLineStart = false;
            }
            const c = src[i];
            if (c === "\n") { i++; if (depth > 0) { line++; continue; } if (toks.length && toks[toks.length - 1].t !== "NEWLINE") push("NEWLINE"); line++; atLineStart = true; continue; }
            if (c === " ") { i++; continue; }
            if (c === "#") { while (i < src.length && src[i] !== "\n") i++; continue; }
            if (c === "\\" && src[i + 1] === "\n") { i += 2; line++; continue; }
            // Cadenas (con prefijo f opcional)
            const pm = /^([fF]?[rR]?|[rR][fF])(['"])/.exec(src.slice(i, i + 3));
            if (pm && (pm[1].length || pm[2])) {
                const prefix = pm[1].toLowerCase(), isF = prefix.includes("f"), raw = prefix.includes("r"), q = pm[2];
                let j = i + pm[1].length; const triple = src.startsWith(q.repeat(3), j);
                j += triple ? 3 : 1; let out = "", closed = false;
                while (j < src.length) {
                    if (triple ? src.startsWith(q.repeat(3), j) : src[j] === q) { j += triple ? 3 : 1; closed = true; break; }
                    if (src[j] === "\n" && !triple) break;
                    if (src[j] === "\\" && !raw) {
                        const n = src[j + 1];
                        const map = { n: "\n", t: "\t", "\\": "\\", "'": "'", '"': '"', "0": "\0", r: "\r" };
                        if (n === "\n") { j += 2; line++; continue; }
                        if (n in map) { out += map[n]; j += 2; continue; }
                        out += "\\"; j++; continue;
                    }
                    if (src[j] === "\n") line++;
                    out += src[j]; j++;
                }
                if (!closed) throw new PyError("SyntaxError", triple ? "unterminated triple-quoted string literal" : "unterminated string literal", line);
                push(isF ? "FSTR" : "STR", out); i = j; continue;
            }
            if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] || ""))) {
                const m = /^(\d[\d_]*)?(\.\d[\d_]*|\.)?([eE][+-]?\d+)?/.exec(src.slice(i));
                let txt = m[0];
                if (/^\d+\.[A-Za-z_]/.test(src.slice(i)) && !m[3]) txt = m[1]; // 3.upper no es decimal
                i += txt.length;
                if (/[A-Za-z_]/.test(src[i] || "")) throw new PyError("SyntaxError", "invalid decimal literal", line);
                const clean = txt.replace(/_/g, "");
                if (/[.eE]/.test(clean)) push("NUM", new PyFloat(parseFloat(clean))); else push("NUM", parseInt(clean, 10));
                continue;
            }
            if ("\u201C\u201D\u2018\u2019".includes(c)) throw new PyError("SyntaxError", "invalid character '" + c + "' (usa comillas rectas \" o ')", line);
            if (/[A-Za-z_\u00C0-\uFFFF]/.test(c)) {
                const m = /^[A-Za-z_0-9\u00C0-\uFFFF]+/.exec(src.slice(i)); push("NAME", m[0]); i += m[0].length; continue;
            }
            const s3 = src.substr(i, 3), s2 = src.substr(i, 2);
            if (OPS3.includes(s3)) { push("OP", s3); i += 3; continue; }
            if (OPS2.includes(s2)) { push("OP", s2); i += 2; continue; }
            if (OPS1.includes(c)) { if ("([{".includes(c)) depth++; if (")]}".includes(c)) depth = Math.max(0, depth - 1); push("OP", c); i++; continue; }
            if (c === "$" || c === "?" || c === "`") throw new PyError("SyntaxError", "invalid syntax", line);
            throw new PyError("SyntaxError", "invalid character '" + c + "'", line);
        }
        if (depth > 0) throw new PyError("SyntaxError", "'(' was never closed", line);
        if (toks.length && toks[toks.length - 1].t !== "NEWLINE") push("NEWLINE");
        while (indents.length > 1) { indents.pop(); push("DEDENT"); }
        push("EOF");
        return toks;
    }

    /* ---------- Parser ---------- */
    const KEYWORDS = new Set(["False", "None", "True", "and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else", "except", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try", "while", "with", "yield"]);
    const UNSUPPORTED_KW = new Set(["as", "assert", "class", "del", "except", "finally", "from", "global", "import", "is", "lambda", "nonlocal", "raise", "try", "with", "yield"]);

    function parse(toks) {
        let p = 0;
        const peek = () => toks[p], next = () => toks[p++];
        const isOp = (v) => toks[p].t === "OP" && toks[p].v === v;
        const isKw = (v) => toks[p].t === "NAME" && toks[p].v === v;
        const err = (msg, tk) => { throw new PyError("SyntaxError", msg || "invalid syntax", (tk || peek()).line); };
        const expectOp = (v, msg) => { if (!isOp(v)) err(msg || "invalid syntax"); return next(); };
        const expectKw = v => { if (!isKw(v)) err("invalid syntax"); return next(); };

        function parseProgram() {
            const body = [];
            while (peek().t !== "EOF") { if (peek().t === "NEWLINE") { next(); continue; } body.push(parseStmt()); }
            return body;
        }
        function parseBlock() {
            expectOp(":", "expected ':'");
            if (peek().t === "NEWLINE") {
                next();
                if (peek().t !== "INDENT") throw new PyError("IndentationError", "expected an indented block", peek().line);
                next();
                const body = [];
                while (peek().t !== "DEDENT" && peek().t !== "EOF") { if (peek().t === "NEWLINE") { next(); continue; } body.push(parseStmt()); }
                if (peek().t === "DEDENT") next();
                if (!body.length) err("expected an indented block");
                return body;
            }
            const s = parseSimple(); if (peek().t === "NEWLINE") next(); return [s];
        }
        function parseStmt() {
            const tk = peek();
            if (tk.t === "INDENT") throw new PyError("IndentationError", "unexpected indent", tk.line);
            if (tk.t === "NAME") {
                if (UNSUPPORTED_KW.has(tk.v)) throw new PyUnsupported(tk.v, tk.line);
                if (tk.v === "if") return parseIf();
                if (tk.v === "while") { next(); const test = parseExpr(); const body = parseBlock(); return { k: "while", test, body, line: tk.line }; }
                if (tk.v === "for") {
                    next(); const target = parseTargetList(); expectKw("in"); const iter = parseTestList(); const body = parseBlock();
                    return { k: "for", target, iter, body, line: tk.line };
                }
                if (tk.v === "def") return parseDef();
                if (tk.v === "else" || tk.v === "elif") err("invalid syntax", tk);
            }
            const s = parseSimple();
            if (peek().t === "NEWLINE") next(); else if (peek().t !== "EOF") err("invalid syntax");
            return s;
        }
        function parseIf() {
            const tk = next(); const test = parseExpr(); const body = parseBlock(); let orelse = [];
            if (isKw("elif")) { orelse = [parseIf()]; }
            else if (isKw("else")) { next(); orelse = parseBlock(); }
            return { k: "if", test, body, orelse, line: tk.line };
        }
        function parseDef() {
            const tk = next(); const nameTk = next(); if (nameTk.t !== "NAME" || KEYWORDS.has(nameTk.v)) err("invalid syntax", nameTk);
            expectOp("(", "expected '('");
            const params = [];
            while (!isOp(")")) {
                const pn = next(); if (pn.t !== "NAME" || KEYWORDS.has(pn.v)) err("invalid syntax", pn);
                let def = undefined;
                if (isOp("=")) { next(); def = parseExpr(); }
                params.push({ name: pn.v, def });
                if (isOp(",")) next(); else break;
            }
            expectOp(")", "expected ')'");
            const body = parseBlock();
            return { k: "def", name: nameTk.v, params, body, line: tk.line };
        }
        function parseSimple() {
            const tk = peek();
            if (tk.t === "NAME") {
                if (UNSUPPORTED_KW.has(tk.v)) throw new PyUnsupported(tk.v, tk.line);
                if (tk.v === "pass") { next(); return { k: "pass", line: tk.line }; }
                if (tk.v === "break") { next(); return { k: "break", line: tk.line }; }
                if (tk.v === "continue") { next(); return { k: "continue", line: tk.line }; }
                if (tk.v === "return") { next(); let v = null; if (peek().t !== "NEWLINE" && peek().t !== "EOF") v = parseTestList(); return { k: "return", value: v, line: tk.line }; }
            }
            const first = parseTestList();
            const t = peek();
            if (t.t === "OP" && ["+=", "-=", "*=", "/=", "//=", "%=", "**="].includes(t.v)) {
                next(); checkTarget(first, t); const value = parseTestList();
                return { k: "aug", target: first, op: t.v.slice(0, -1), value, line: tk.line };
            }
            if (isOp("=")) {
                const targets = [first]; let value;
                while (isOp("=")) { next(); value = parseTestList(); if (isOp("=")) targets.push(value); }
                targets.forEach(x => checkTarget(x, t));
                return { k: "assign", targets, value, line: tk.line };
            }
            return { k: "expr", value: first, line: tk.line };
        }
        function checkTarget(n, tk) {
            if (n.k === "name" || n.k === "index") return;
            if (n.k === "tuple" && n.items.every(x => x.k === "name" || x.k === "index")) return;
            throw new PyError("SyntaxError", n.k === "call" ? "cannot assign to function call here. Maybe you meant '==' instead of '='?" : "cannot assign to expression here. Maybe you meant '==' instead of '='?", tk.line);
        }
        function parseTargetList() {
            const items = [];
            do { const t = next(); if (t.t !== "NAME" || KEYWORDS.has(t.v)) err("invalid syntax", t); items.push({ k: "name", name: t.v, line: t.line }); if (isOp(",")) next(); else break; } while (!isKw("in"));
            return items.length === 1 ? items[0] : { k: "tuple", items };
        }
        function parseTestList() {
            const first = parseExpr();
            if (isOp(",")) {
                const items = [first];
                while (isOp(",")) { next(); if (peek().t === "NEWLINE" || isOp("=") || isOp(")") || peek().t === "EOF") break; items.push(parseExpr()); }
                return { k: "tuple", items, line: first.line };
            }
            return first;
        }
        function parseExpr() {
            const left = parseOr();
            if (isKw("if")) { const tk = next(); const test = parseOr(); expectKw("else"); const other = parseExpr(); return { k: "ternary", test, a: left, b: other, line: tk.line }; }
            return left;
        }
        function parseOr() { let l = parseAnd(); while (isKw("or")) { const tk = next(); l = { k: "bool", op: "or", a: l, b: parseAnd(), line: tk.line }; } return l; }
        function parseAnd() { let l = parseNot(); while (isKw("and")) { const tk = next(); l = { k: "bool", op: "and", a: l, b: parseNot(), line: tk.line }; } return l; }
        function parseNot() { if (isKw("not")) { const tk = next(); return { k: "not", a: parseNot(), line: tk.line }; } return parseCmp(); }
        function parseCmp() {
            const first = parseAdd(); const ops = [], rest = [];
            for (; ;) {
                const t = peek(); let op = null;
                if (t.t === "OP" && ["==", "!=", "<", ">", "<=", ">="].includes(t.v)) { op = t.v; next(); }
                else if (isKw("in")) { op = "in"; next(); }
                else if (isKw("not") && toks[p + 1].t === "NAME" && toks[p + 1].v === "in") { op = "not in"; next(); next(); }
                else if (isKw("is")) throw new PyUnsupported("is", t.line);
                else break;
                ops.push({ op, line: t.line }); rest.push(parseAdd());
            }
            return ops.length ? { k: "cmp", first, ops, rest, line: first.line } : first;
        }
        function parseAdd() { let l = parseMul(); while (isOp("+") || isOp("-")) { const t = next(); l = { k: "bin", op: t.v, a: l, b: parseMul(), line: t.line }; } return l; }
        function parseMul() { let l = parseUnary(); while (isOp("*") || isOp("/") || isOp("//") || isOp("%")) { const t = next(); l = { k: "bin", op: t.v, a: l, b: parseUnary(), line: t.line }; } return l; }
        function parseUnary() { if (isOp("-") || isOp("+")) { const t = next(); return { k: "unary", op: t.v, a: parseUnary(), line: t.line }; } return parsePow(); }
        function parsePow() { const base = parsePostfix(); if (isOp("**")) { const t = next(); return { k: "bin", op: "**", a: base, b: parseUnary(), line: t.line }; } return base; }
        function parsePostfix() {
            let n = parseAtom();
            for (; ;) {
                if (isOp("(")) {
                    const t = next(); const args = [], kwargs = [];
                    while (!isOp(")")) {
                        if (isOp("*") || isOp("**")) throw new PyUnsupported("*args", t.line);
                        if (peek().t === "NAME" && toks[p + 1].t === "OP" && toks[p + 1].v === "=" ) { const nm = next().v; next(); kwargs.push({ name: nm, value: parseExpr() }); }
                        else args.push(parseExpr());
                        if (isOp(",")) next(); else break;
                    }
                    if (!isOp(")")) err("'(' was never closed", t); next();
                    n = { k: "call", fn: n, args, kwargs, line: t.line };
                } else if (isOp("[")) {
                    const t = next();
                    if (isOp(":")) throw new PyUnsupported("slice", t.line);
                    const idx = parseExpr();
                    if (isOp(":")) throw new PyUnsupported("slice", t.line);
                    expectOp("]", "expected ']'"); n = { k: "index", obj: n, idx, line: t.line };
                } else if (isOp(".")) {
                    const t = next(); const nm = next(); if (nm.t !== "NAME") err("invalid syntax", nm);
                    n = { k: "attr", obj: n, name: nm.v, line: t.line };
                } else break;
            }
            return n;
        }
        function parseAtom() {
            const t = next();
            if (t.t === "NUM") return { k: "const", v: t.v, line: t.line };
            if (t.t === "STR") { let s = t.v; while (peek().t === "STR") s += next().v; return { k: "const", v: s, line: t.line }; }
            if (t.t === "FSTR") return parseFString(t);
            if (t.t === "NAME") {
                if (t.v === "True") return { k: "const", v: true, line: t.line };
                if (t.v === "False") return { k: "const", v: false, line: t.line };
                if (t.v === "None") return { k: "const", v: null, line: t.line };
                if (KEYWORDS.has(t.v)) { if (UNSUPPORTED_KW.has(t.v)) throw new PyUnsupported(t.v, t.line); err("invalid syntax", t); }
                return { k: "name", name: t.v, line: t.line };
            }
            if (t.t === "OP") {
                if (t.v === "(") {
                    if (isOp(")")) { next(); return { k: "tuple", items: [], line: t.line }; }
                    const first = parseExpr();
                    if (isOp(",")) { const items = [first]; while (isOp(",")) { next(); if (isOp(")")) break; items.push(parseExpr()); } expectOp(")", "'(' was never closed"); return { k: "tuple", items, line: t.line }; }
                    expectOp(")", "'(' was never closed"); return first;
                }
                if (t.v === "[") {
                    const items = [];
                    while (!isOp("]")) { items.push(parseExpr()); if (isKw("for")) throw new PyUnsupported("comprehension", t.line); if (isOp(",")) next(); else break; }
                    expectOp("]", "'[' was never closed"); return { k: "list", items, line: t.line };
                }
                if (t.v === "{") throw new PyUnsupported("dict/set", t.line);
            }
            if (t.t === "NEWLINE" || t.t === "EOF") err("invalid syntax", t);
            err("invalid syntax", t);
        }
        function parseFString(t) {
            const s = t.v, parts = []; let i = 0, buf = "";
            while (i < s.length) {
                const c = s[i];
                if (c === "{" && s[i + 1] === "{") { buf += "{"; i += 2; continue; }
                if (c === "}" && s[i + 1] === "}") { buf += "}"; i += 2; continue; }
                if (c === "{") {
                    if (buf) { parts.push({ lit: buf }); buf = ""; }
                    let depth = 1, j = i + 1, inStr = null;
                    while (j < s.length && depth > 0) { const d = s[j]; if (inStr) { if (d === inStr) inStr = null; } else if (d === "'" || d === '"') inStr = d; else if (d === "{") depth++; else if (d === "}") depth--; j++; }
                    if (depth > 0) throw new PyError("SyntaxError", "f-string: expecting '}'", t.line);
                    let inner = s.slice(i + 1, j - 1), spec = "";
                    const ci = findSpec(inner); if (ci >= 0) { spec = inner.slice(ci + 1); inner = inner.slice(0, ci); }
                    if (!inner.trim()) throw new PyError("SyntaxError", "f-string: empty expression not allowed", t.line);
                    if (/!\w$/.test(inner.trim())) throw new PyUnsupported("f-string conversion", t.line);
                    const sub = tokenize(inner.trim()); sub.forEach(x => (x.line = t.line));
                    const expr = parse(sub, true);
                    parts.push({ expr, spec });
                    i = j; continue;
                }
                if (c === "}") throw new PyError("SyntaxError", "f-string: single '}' is not allowed", t.line);
                buf += c; i++;
            }
            if (buf) parts.push({ lit: buf });
            return { k: "fstr", parts, line: t.line };
        }
        function findSpec(inner) { let depth = 0, q = null; for (let i = 0; i < inner.length; i++) { const c = inner[i]; if (q) { if (c === q) q = null; continue; } if (c === "'" || c === '"') q = c; else if ("([{".includes(c)) depth++; else if (")]}".includes(c)) depth--; else if (c === ":" && depth === 0) return i; } return -1; }

        if (arguments[1] === true) { const e = parseExpr(); return e; }
        return parseProgram();
    }

    /* ---------- Ejecución ---------- */
    const MAX_STEPS = 400000, MAX_DEPTH = 120, MAX_OUT = 20000;

    function run(src, opts) {
        opts = opts || {};
        const out = []; let outLen = 0, steps = 0, depth = 0;
        const globals = new Map();
        const E = (type, msg, line) => new PyError(type, msg, line);
        const tick = line => { if (++steps > MAX_STEPS) throw E("TimeoutError", "El programa tardó demasiado. ¿Hay un ciclo que nunca termina?", line); };
        const write = s => { outLen += s.length; if (outLen > MAX_OUT) throw E("RuntimeError", "El programa escribió demasiado texto.", null); out.push(s); };

        /* operaciones */
        function arith(op, a, b, line) {
            if (isBool(a)) a = a ? 1 : 0; if (isBool(b)) b = b ? 1 : 0;
            if (op === "+") {
                if (isStr(a) && isStr(b)) return a + b;
                if (isList(a) && isList(b)) return a.concat(b);
                if (a instanceof PyTuple && b instanceof PyTuple) return new PyTuple(a.items.concat(b.items));
                if (isStr(a)) throw E("TypeError", `can only concatenate str (not "${tname(b)}") to str`, line);
                if (isList(a)) throw E("TypeError", `can only concatenate list (not "${tname(b)}") to list`, line);
            }
            if (op === "*") {
                if ((isStr(a) || isList(a)) && isInt(b)) { if (isStr(a)) return b > 0 ? a.repeat(b) : ""; const r = []; for (let i = 0; i < b; i++) r.push(...a); return r; }
                if ((isStr(b) || isList(b)) && isInt(a)) return arith("*", b, a, line);
                if (isStr(a) && isStr(b)) throw E("TypeError", "can't multiply sequence by non-int of type 'str'", line);
                if ((isStr(a) || isList(a)) && isFloat(b)) throw E("TypeError", "can't multiply sequence by non-int of type 'float'", line);
            }
            if (op === "%" && isStr(a)) throw new PyUnsupported("string % formatting", line);
            if (!isNum(a) || !isNum(b)) throw E("TypeError", `unsupported operand type(s) for ${op}: '${tname(a)}' and '${tname(b)}'`, line);
            const fl = isFloat(a) || isFloat(b), x = num(a), y = num(b);
            const mk = v => (fl ? new PyFloat(v) : v);
            switch (op) {
                case "+": return mk(x + y);
                case "-": return mk(x - y);
                case "*": return mk(x * y);
                case "/": if (y === 0) throw E("ZeroDivisionError", "division by zero", line); return new PyFloat(x / y);
                case "//": if (y === 0) throw E("ZeroDivisionError", fl ? "float floor division by zero" : "integer division or modulo by zero", line); return mk(Math.floor(x / y));
                case "%": if (y === 0) throw E("ZeroDivisionError", fl ? "float modulo by zero" : "integer modulo by zero", line); return mk(((x % y) + y) % y);
                case "**": {
                    if (!fl && y >= 0) { const r = Math.pow(x, y); if (!Number.isSafeInteger(r)) throw new PyUnsupported("big integers", line); return r; }
                    if (x === 0 && y < 0) throw E("ZeroDivisionError", "0.0 cannot be raised to a negative power", line);
                    return new PyFloat(Math.pow(x, y));
                }
            }
            throw E("SyntaxError", "invalid syntax", line);
        }
        function eq(a, b) {
            if (isNum(a) || isBool(a)) { if (isNum(b) || isBool(b)) return num(a) === num(b); return false; }
            if (isList(a) && isList(b)) return a.length === b.length && a.every((x, i) => eq(x, b[i]));
            if (a instanceof PyTuple && b instanceof PyTuple) return a.items.length === b.items.length && a.items.every((x, i) => eq(x, b.items[i]));
            return a === b;
        }
        function compare(op, a, b, line) {
            if (op === "==") return eq(a, b);
            if (op === "!=") return !eq(a, b);
            if (op === "in" || op === "not in") {
                let r;
                if (isStr(b)) { if (!isStr(a)) throw E("TypeError", `'in <string>' requires string as left operand, not ${tname(a)}`, line); r = b.includes(a); }
                else if (isList(b)) r = b.some(x => eq(x, a));
                else if (b instanceof PyTuple) r = b.items.some(x => eq(x, a));
                else throw E("TypeError", `argument of type '${tname(b)}' is not iterable`, line);
                return op === "in" ? r : !r;
            }
            let x, y;
            if ((isNum(a) || isBool(a)) && (isNum(b) || isBool(b))) { x = num(a); y = num(b); }
            else if (isStr(a) && isStr(b)) { x = a; y = b; }
            else if (isList(a) && isList(b)) { x = a.map(repr).join(); y = b.map(repr).join(); }
            else throw E("TypeError", `'${op}' not supported between instances of '${tname(a)}' and '${tname(b)}'`, line);
            return op === "<" ? x < y : op === ">" ? x > y : op === "<=" ? x <= y : x >= y;
        }
        function toIter(v, line) {
            if (isList(v)) return v.slice();
            if (isStr(v)) return [...v];
            if (v instanceof PyTuple) return v.items.slice();
            throw E("TypeError", `'${tname(v)}' object is not iterable`, line);
        }
        function fmtSpec(v, spec, line) {
            if (!spec) return str(v);
            let m = /^([<>^]?)(\d*)(?:,)?(?:\.(\d+))?([dfs]?)$/.exec(spec);
            if (!m) throw new PyUnsupported("format spec", line);
            const [, align, width, prec, ty] = m; let s;
            if (ty === "f" || (prec !== undefined && isNum(v))) { if (!isNum(v)) throw E("ValueError", "Unknown format code 'f' for object of type 'str'", line); s = num(v).toFixed(prec === undefined ? 6 : Number(prec)); }
            else if (ty === "d") { if (!isInt(v)) throw E("ValueError", `Unknown format code 'd' for object of type '${tname(v)}'`, line); s = String(v); }
            else s = str(v);
            if (spec.includes(",") && isNum(v)) { const [ip, fp] = s.split("."); s = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (fp ? "." + fp : ""); }
            if (width) { const w = Number(width), al = align || (isNum(v) ? ">" : "<"); s = al === "<" ? s.padEnd(w) : al === ">" ? s.padStart(w) : s.padStart(Math.floor((w + s.length) / 2)).padEnd(w); }
            return s;
        }

        /* entornos */
        class Env { constructor(parent, isGlobal) { this.vars = isGlobal ? globals : new Map(); this.parent = parent; } }
        const BUILTINS = {
            print(args, kw) {
                const sep = kw.sep === undefined || kw.sep === null ? " " : kw.sep, end = kw.end === undefined || kw.end === null ? "\n" : kw.end;
                write(args.map(str).join(sep) + end); return null;
            },
            len(a, kw, line) { const v = a[0]; if (isStr(v) || isList(v)) return v.length; if (v instanceof PyTuple) return v.items.length; throw E("TypeError", `object of type '${tname(v)}' has no len()`, line); },
            range(a, kw, line) {
                a.forEach(x => { if (!isInt(x)) throw E("TypeError", `'${tname(x)}' object cannot be interpreted as an integer`, line); });
                let s = 0, e, st = 1;
                if (a.length === 1) e = a[0]; else if (a.length === 2) { s = a[0]; e = a[1]; } else if (a.length === 3) { s = a[0]; e = a[1]; st = a[2]; } else throw E("TypeError", "range expected at least 1 argument, got 0", line);
                if (st === 0) throw E("ValueError", "range() arg 3 must not be zero", line);
                const r = []; if (st > 0) for (let i = s; i < e; i += st) { r.push(i); if (r.length > 200000) break; } else for (let i = s; i > e; i += st) { r.push(i); if (r.length > 200000) break; }
                return r;
            },
            int(a, kw, line) {
                const v = a[0]; if (v === undefined) return 0;
                if (isInt(v)) return v; if (isBool(v)) return v ? 1 : 0; if (isFloat(v)) { if (!Number.isFinite(v.v)) throw E("OverflowError", "cannot convert float infinity to integer", line); return Math.trunc(v.v); }
                if (isStr(v)) { const t = v.trim().replace(/_/g, ""); if (!/^[+-]?\d+$/.test(t)) throw E("ValueError", `invalid literal for int() with base 10: ${reprStr(v)}`, line); return parseInt(t, 10); }
                throw E("TypeError", `int() argument must be a string, a real number, not '${tname(v)}'`, line);
            },
            float(a, kw, line) {
                const v = a[0]; if (v === undefined) return new PyFloat(0);
                if (isNum(v) || isBool(v)) return new PyFloat(num(v));
                if (isStr(v)) { const t = v.trim(); if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) throw E("ValueError", `could not convert string to float: ${reprStr(v)}`, line); return new PyFloat(parseFloat(t)); }
                throw E("TypeError", `float() argument must be a string or a real number, not '${tname(v)}'`, line);
            },
            str(a) { return a.length ? str(a[0]) : ""; },
            bool(a) { return a.length ? truthy(a[0]) : false; },
            abs(a, kw, line) { const v = a[0]; if (!isNum(v) && !isBool(v)) throw E("TypeError", `bad operand type for abs(): '${tname(v)}'`, line); return isFloat(v) ? new PyFloat(Math.abs(v.v)) : Math.abs(num(v)); },
            round(a, kw, line) {
                const v = a[0], nd = a[1];
                if (!isNum(v) && !isBool(v)) throw E("TypeError", `type ${tname(v)} doesn't define __round__ method`, line);
                const half = y => { const f = Math.floor(y), d = y - f; return d < 0.5 ? f : d > 0.5 ? f + 1 : (f % 2 === 0 ? f : f + 1); };
                const x = num(v);
                if (nd === undefined || nd === null) return half(x);
                if (isInt(v)) return v;
                if (nd < 0) { const m = Math.pow(10, nd); return new PyFloat(half(x * m) / m); }
                // Redondeo exacto como Python: mira los dígitos reales del número en binario.
                const sx = Math.abs(x).toFixed(Math.min(100, nd + 30)), dot = sx.indexOf("."), keep = sx.slice(0, dot + 1 + nd).replace(/\.$/, ""), rest = sx.slice(dot + 1 + nd);
                let r = Number(Math.abs(x).toFixed(nd));
                if (/^50*$/.test(rest)) { const last = Number(keep.replace(".", "").slice(-1)); r = Number(keep); if (last % 2 === 1) r += Math.pow(10, -nd); }
                return new PyFloat(x < 0 ? -r : r);
            },
            min(a, kw, line) { const xs = a.length === 1 ? toIter(a[0], line) : a; if (!xs.length) throw E("ValueError", "min() arg is an empty sequence", line); return xs.reduce((m, x) => (compare("<", x, m, line) ? x : m)); },
            max(a, kw, line) { const xs = a.length === 1 ? toIter(a[0], line) : a; if (!xs.length) throw E("ValueError", "max() arg is an empty sequence", line); return xs.reduce((m, x) => (compare(">", x, m, line) ? x : m)); },
            sum(a, kw, line) { return toIter(a[0], line).reduce((s, x) => arith("+", s, x, line), a[1] === undefined ? 0 : a[1]); },
            type(a) { return new PyType(tname(a[0])); },
            input() { throw E("RuntimeError", "input() no está disponible en este juego. Escribe los valores directamente en el código.", null); },
            list(a, kw, line) { return a.length ? toIter(a[0], line) : []; },
            sorted(a, kw, line) { const xs = toIter(a[0], line); xs.sort((p, q) => (compare("<", p, q, line) ? -1 : compare(">", p, q, line) ? 1 : 0)); return xs; },
            isinstance() { throw new PyUnsupported("isinstance"); }
        };
        BUILTINS.str.pyname = "str";

        function callMethod(obj, name, args, line) {
            if (isStr(obj)) {
                switch (name) {
                    case "upper": return obj.toUpperCase();
                    case "lower": return obj.toLowerCase();
                    case "capitalize": return obj.charAt(0).toUpperCase() + obj.slice(1).toLowerCase();
                    case "title": return obj.toLowerCase().replace(/(^|[^\p{L}])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
                    case "strip": return obj.trim();
                    case "replace": return obj.split(args[0]).join(args[1]);
                    case "split": return args.length && args[0] !== null ? obj.split(args[0]) : obj.trim().split(/\s+/).filter(Boolean);
                    case "startswith": return obj.startsWith(args[0]);
                    case "endswith": return obj.endsWith(args[0]);
                    case "count": return args[0] === "" ? obj.length + 1 : obj.split(args[0]).length - 1;
                    case "join": return toIter(args[0], line).map(x => { if (!isStr(x)) throw E("TypeError", `sequence item 0: expected str instance, ${tname(x)} found`, line); return x; }).join(obj);
                    case "format": throw new PyUnsupported("str.format", line);
                }
            } else if (isList(obj)) {
                switch (name) {
                    case "append": obj.push(args[0]); return null;
                    case "pop": { if (!obj.length) throw E("IndexError", "pop from empty list", line); const i = args.length ? args[0] : obj.length - 1; return obj.splice(i < 0 ? obj.length + i : i, 1)[0]; }
                    case "insert": obj.splice(args[0], 0, args[1]); return null;
                    case "remove": { const i = obj.findIndex(x => eq(x, args[0])); if (i < 0) throw E("ValueError", "list.remove(x): x not in list", line); obj.splice(i, 1); return null; }
                    case "reverse": obj.reverse(); return null;
                    case "sort": obj.sort((p, q) => (compare("<", p, q, line) ? -1 : compare(">", p, q, line) ? 1 : 0)); return null;
                    case "index": { const i = obj.findIndex(x => eq(x, args[0])); if (i < 0) throw E("ValueError", `${repr(args[0])} is not in list`, line); return i; }
                    case "count": return obj.filter(x => eq(x, args[0])).length;
                }
            }
            if (isStr(obj) || isList(obj)) throw new PyUnsupported("." + name, line);
            throw E("AttributeError", `'${tname(obj)}' object has no attribute '${name}'`, line);
        }

        function lookup(env, name, line) {
            for (let e = env; e; e = e.parent) if (e.vars.has(name)) return e.vars.get(name);
            if (Object.prototype.hasOwnProperty.call(BUILTINS, name)) return BUILTINS[name];
            throw E("NameError", `name '${name}' is not defined`, line);
        }
        function callFn(fn, args, kwargs, line) {
            tick(line);
            if (typeof fn === "function") {
                const kw = {}; kwargs.forEach(k => (kw[k.name] = k.value));
                return fn(args, kw, line);
            }
            if (fn instanceof PyFunc) {
                if (++depth > MAX_DEPTH) { depth--; throw E("RecursionError", "maximum recursion depth exceeded", line); }
                try {
                    const env = new Env(fn.env, false), ps = fn.params;
                    const bound = new Map();
                    if (args.length > ps.length) throw E("TypeError", `${fn.name}() takes ${ps.length} positional argument${ps.length === 1 ? "" : "s"} but ${args.length} ${args.length === 1 ? "was" : "were"} given`, line);
                    args.forEach((v, i) => bound.set(ps[i].name, v));
                    kwargs.forEach(k => { if (!ps.some(p => p.name === k.name)) throw E("TypeError", `${fn.name}() got an unexpected keyword argument '${k.name}'`, line); if (bound.has(k.name)) throw E("TypeError", `${fn.name}() got multiple values for argument '${k.name}'`, line); bound.set(k.name, k.value); });
                    const missing = [];
                    ps.forEach(p => { if (!bound.has(p.name)) { if (p.defVal !== undefined) bound.set(p.name, p.defVal); else missing.push(p.name); } });
                    if (missing.length) throw E("TypeError", `${fn.name}() missing ${missing.length} required positional argument${missing.length === 1 ? "" : "s"}: ${missing.map(m => "'" + m + "'").join(" and ")}`, line);
                    bound.forEach((v, k) => env.vars.set(k, v));
                    try { execBlock(fn.body, env); } catch (s) { if (s instanceof Ret) return s.v; throw s; }
                    return null;
                } finally { depth--; }
            }
            throw E("TypeError", `'${tname(fn)}' object is not callable`, line);
        }

        function ev(n, env) {
            switch (n.k) {
                case "const": return n.v;
                case "name": return lookup(env, n.name, n.line);
                case "list": return n.items.map(x => ev(x, env));
                case "tuple": return new PyTuple(n.items.map(x => ev(x, env)));
                case "fstr": return n.parts.map(pt => (pt.lit !== undefined ? pt.lit : fmtSpec(ev(pt.expr, env), pt.spec, n.line))).join("");
                case "unary": { const v = ev(n.a, env); if (!isNum(v) && !isBool(v)) throw E("TypeError", `bad operand type for unary ${n.op}: '${tname(v)}'`, n.line); const x = num(v); const r = n.op === "-" ? -x : x; return isFloat(v) ? new PyFloat(r) : r; }
                case "not": return !truthy(ev(n.a, env));
                case "bool": { const a = ev(n.a, env); if (n.op === "and") return truthy(a) ? ev(n.b, env) : a; return truthy(a) ? a : ev(n.b, env); }
                case "ternary": return truthy(ev(n.test, env)) ? ev(n.a, env) : ev(n.b, env);
                case "bin": return arith(n.op, ev(n.a, env), ev(n.b, env), n.line);
                case "cmp": { let l = ev(n.first, env); for (let i = 0; i < n.ops.length; i++) { const r = ev(n.rest[i], env); if (!compare(n.ops[i].op, l, r, n.ops[i].line)) return false; l = r; } return true; }
                case "index": {
                    const o = ev(n.obj, env), i = ev(n.idx, env);
                    if (!isInt(i)) throw E("TypeError", `${isStr(o) ? "string" : "list"} indices must be integers or slices, not ${tname(i)}`, n.line);
                    if (isList(o) || isStr(o) || o instanceof PyTuple) { const arr = o instanceof PyTuple ? o.items : o; const j = i < 0 ? arr.length + i : i; if (j < 0 || j >= arr.length) throw E("IndexError", `${isStr(o) ? "string" : o instanceof PyTuple ? "tuple" : "list"} index out of range`, n.line); return arr[j]; }
                    throw E("TypeError", `'${tname(o)}' object is not subscriptable`, n.line);
                }
                case "attr": { const o = ev(n.obj, env); const nm = n.name; return { __bound: true, o, nm, line: n.line }; }
                case "call": {
                    if (n.fn.k === "attr") {
                        const o = ev(n.fn.obj, env), args = n.args.map(a => ev(a, env));
                        if (n.kwargs.length) throw new PyUnsupported("keyword args in method", n.line);
                        tick(n.line); return callMethod(o, n.fn.name, args, n.line);
                    }
                    const fn = ev(n.fn, env), args = n.args.map(a => ev(a, env)), kw = n.kwargs.map(k => ({ name: k.name, value: ev(k.value, env) }));
                    return callFn(fn, args, kw, n.line);
                }
            }
            throw new PyUnsupported(n.k, n.line);
        }
        function assignTo(t, v, env) {
            if (t.k === "name") { env.vars.set(t.name, v); return; }
            if (t.k === "index") {
                const o = ev(t.obj, env), i = ev(t.idx, env);
                if (!isList(o)) throw E("TypeError", `'${tname(o)}' object does not support item assignment`, t.line);
                if (!isInt(i)) throw E("TypeError", "list indices must be integers or slices, not " + tname(i), t.line);
                const j = i < 0 ? o.length + i : i; if (j < 0 || j >= o.length) throw E("IndexError", "list assignment index out of range", t.line);
                o[j] = v; return;
            }
            if (t.k === "tuple") {
                const vals = v instanceof PyTuple ? v.items : toIter(v, t.line);
                if (vals.length !== t.items.length) throw E("ValueError", vals.length > t.items.length ? `too many values to unpack (expected ${t.items.length})` : `not enough values to unpack (expected ${t.items.length}, got ${vals.length})`, t.line);
                t.items.forEach((x, i) => assignTo(x, vals[i], env));
            }
        }
        function execBlock(body, env) { for (let i = 0; i < body.length; i++) exec(body[i], env); }
        function exec(s, env) {
            tick(s.line);
            switch (s.k) {
                case "expr": ev(s.value, env); return;
                case "assign": { const v = ev(s.value, env); s.targets.forEach(t => assignTo(t, v, env)); return; }
                case "aug": {
                    const cur = ev(s.target, env), v = ev(s.value, env);
                    if (isList(cur) && s.op === "+" && isList(v)) { cur.push(...v); return; }
                    assignTo(s.target, arith(s.op, cur, v, s.line), env); return;
                }
                case "if": if (truthy(ev(s.test, env))) execBlock(s.body, env); else execBlock(s.orelse, env); return;
                case "while": {
                    while (truthy(ev(s.test, env))) { tick(s.line); try { execBlock(s.body, env); } catch (x) { if (x instanceof Brk) break; if (x instanceof Cont) continue; throw x; } }
                    return;
                }
                case "for": {
                    const items = toIter(ev(s.iter, env), s.line);
                    for (const it of items) { tick(s.line); assignTo(s.target, it, env); try { execBlock(s.body, env); } catch (x) { if (x instanceof Brk) break; if (x instanceof Cont) continue; throw x; } }
                    return;
                }
                case "def": {
                    const params = s.params.map(p => ({ name: p.name, defVal: p.def ? ev(p.def, env) : undefined }));
                    env.vars.set(s.name, new PyFunc(s.name, params, s.body, env)); return;
                }
                case "return": throw new Ret(s.value ? ev(s.value, env) : null);
                case "break": throw new Brk();
                case "continue": throw new Cont();
                case "pass": return;
            }
            throw new PyUnsupported(s.k, s.line);
        }

        // Resultado
        const result = { engine: "mini", ok: true, stdout: "", vars: {}, error: null, unsupported: null };
        try {
            const ast = parse(tokenize(src));
            const genv = new Env(null, true);
            try { execBlock(ast, genv); }
            catch (x) { if (x instanceof Ret) throw E("SyntaxError", "'return' outside function", null); if (x instanceof Brk || x instanceof Cont) throw E("SyntaxError", "'break' outside loop", null); throw x; }
        } catch (e) {
            if (e instanceof PyUnsupported) { result.ok = false; result.unsupported = e.message; result.error = { type: "Unsupported", message: e.message, line: e.line }; }
            else if (e instanceof PyError) { result.ok = false; result.error = { type: e.pyType, message: e.message, line: e.line }; }
            else if (e instanceof RangeError) { result.ok = false; result.error = { type: "RecursionError", message: "maximum recursion depth exceeded", line: null }; }
            else throw e;
        }
        result.stdout = out.join("");
        const typeOf = v => (isBool(v) ? "bool" : isInt(v) ? "int" : isFloat(v) ? "float" : isStr(v) ? "str" : isList(v) ? "list" : v === null ? "NoneType" : null);
        const plain = v => (isFloat(v) ? v.v : isList(v) ? v.map(plain) : v);
        globals.forEach((v, k) => {
            const t = typeOf(v);
            if (t && !k.startsWith("_")) result.vars[k] = { type: t, value: plain(v), repr: repr(v) };
            else if (v instanceof PyFunc) result.vars[k] = { type: "function", value: null, repr: repr(v) };
        });
        return result;
    }

    FC.PyInterp = { run };
})();
