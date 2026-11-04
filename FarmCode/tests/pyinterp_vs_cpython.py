"""Compara el intérprete de Python del juego (js/pyinterp.js) con el Python real.
Requisitos: python3 y node.   Uso:  python3 tests/pyinterp_vs_cpython.py"""
import json, subprocess, io, contextlib, os, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
ns = {}; exec(open(os.path.join(HERE, "corpus_python.py")).read(), ns); CASES = ns["CASES"]
CASES += [
 "print(round(0.125, 2), round(0.375, 2), round(-2.5), round(2.5, 0), round(1234.5678, 2))",
 "print(5e-5, 1e16, 0.00001234, 1.5e300)",
 "def area(b, h):\n    return b * h / 2\nprint(area(3, 4))",
 "cosechas = [3, 5, 2]\ntotal = 0\nfor c in cosechas:\n    total = total + c\nprint(f'Promedio: {total / len(cosechas):.1f}')",
 "for i in range(3):\n    for j in range(2):\n        print(i, j)",
]
tmp = tempfile.mkdtemp()
json.dump(CASES, open(os.path.join(tmp, "cases.json"), "w"))
js = (f"global.window={{}};require({json.dumps(os.path.join(ROOT,'js','pyinterp.js'))});const fs=require('fs');"
      f"const c=JSON.parse(fs.readFileSync({json.dumps(os.path.join(tmp,'cases.json'))},'utf8'));"
      "const o=c.map(s=>{const r=window.FC.PyInterp.run(s);return {stdout:r.stdout,err:r.error?r.error.type:null,msg:r.error?r.error.message:null}});"
      f"fs.writeFileSync({json.dumps(os.path.join(tmp,'out.json'))},JSON.stringify(o));")
open(os.path.join(tmp, "run.js"), "w").write(js)
subprocess.run(["node", os.path.join(tmp, "run.js")], check=True)
out = json.load(open(os.path.join(tmp, "out.json"))); bad = 0
for i, (src, j) in enumerate(zip(CASES, out)):
    err = None; buf = io.StringIO()
    if "while True" in src: exp, err = "", "TimeoutError"
    elif "return f()" in src: exp, err = "", "RecursionError"
    else:
        try:
            with contextlib.redirect_stdout(buf): exec(compile(src, "<x>", "exec"), {"__name__": "__main__"})
        except BaseException as e: err = type(e).__name__
        exp = buf.getvalue()
    ok = j["stdout"] == exp and (err or None) == (j["err"] or None)
    if not ok: bad += 1; print("DIFERENCIA", i, repr(src), "\n  python:", repr(exp), err, "\n  juego :", repr(j["stdout"]), j["err"])
print(f"{len(CASES)} casos, {bad} diferencias")
raise SystemExit(1 if bad else 0)
