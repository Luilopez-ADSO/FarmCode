import json, os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = {
 ('h1','e1'): "<h1>Mi granja</h1>",
 ('h1','e2'): "<h1>Mi granja</h1>\n<p>Cultivo zanahorias y tomates.</p>",
 ('h2','e1'): "<ul>\n<li>Zanahoria</li>\n<li>Tomate</li>\n<li>Calabaza</li>\n</ul>",
 ('h2','e2'): "<p>Recuerda <strong>regar</strong> las plantas antes de las <em>ocho</em>.</p>",
 ('h3','e1'): '<a href="https://ejemplo.com">Mi blog</a>',
 ('h3','e2'): '<img src="tomate.png" alt="Un tomate rojo">',
 ('h4','e1'): "<header><h1>Mi granja</h1></header><main><p>Bienvenido.</p></main><footer>Hecho con cariño</footer>",
 ('h4','e2'): "<main><section><h2>A</h2><p>uno</p></section><section><h2>B</h2><p>dos</p></section></main>",
 ('h5','e1'): '<!DOCTYPE html>\n<html lang="es"><head><title>Mi granja</title></head><body><h1>Hola</h1><p>Texto</p></body></html>',
 ('h5','e2'): '<header><h1>Mi granja</h1></header><main><ul><li>a</li><li>b</li><li>c</li></ul><img src="g.png" alt="Mi granja"><a href="https://x.com">Visítanos</a></main><footer>Hecho con Farm Code</footer>',
 ('c1','e1'): "h1 { color: green; }",
 ('c1','e2'): "p { font-size: 22px; color: #d9453a; }",
 ('c2','e1'): ".importante { font-weight: bold; color: #d9453a; }",
 ('c2','e2'): "#titulo { text-align: center; color: #3d7ab8; }",
 ('c3','e1'): ".tarjeta { padding: 20px; border: 3px solid green; }",
 ('c3','e2'): ".tarjeta { background-color: #fff3b0; margin-bottom: 16px; }",
 ('c4','e1'): ".boton { background-color: #4caf50; color: white; border-radius: 12px; padding: 10px 20px; }",
 ('c4','e2'): ".sol { width: 80px; height: 80px; background-color: #f5d04c; border-radius: 50%; }",
 ('c5','e1'): ".fila { display: flex; gap: 12px; }",
 ('c5','e2'): ".fila { display: flex; gap: 12px; justify-content: center; }\n.cultivo { background-color: #f08a24; padding: 10px; }",
 ('c5','e3'): ".tarjeta { padding: 20px; border-radius: 12px; background-color: #fff3b0; border: 2px solid #f08a24; }\n.tarjeta h2 { color: #d9731a; }",
 ('j1','e1'): "let semillas = 5;\nconsole.log(semillas);",
 ('j1','e2'): 'const cultivo = "tomate";\nlet agua = 8;\nconsole.log(cultivo);\nconsole.log(agua);',
 ('j2','e1'): "let semillas = 3;\nsemillas += 4;\nconsole.log(semillas);",
 ('j2','e2'): 'let nombre = "Ana";\nlet cosechas = 5;\nconsole.log(`${nombre} cosechó ${cosechas} zanahorias`);',
 ('j3','e1'): 'let semillas = 0;\nif (semillas > 0) {\n  console.log("Puedes sembrar");\n} else {\n  console.log("Necesitas semillas");\n}',
 ('j3','e2'): 'let agua = 5;\nif (agua < 3) {\n  console.log("Necesita agua");\n} else if (agua <= 7) {\n  console.log("Agua perfecta");\n} else {\n  console.log("Demasiada agua");\n}',
 ('j3','e3'): 'let dias = 5;\nlet regada = true;\nif (dias >= 5 && regada) {\n  console.log("Lista para cosechar");\n} else {\n  console.log("Todavía no");\n}',
 ('j4','e1'): 'for (let i = 0; i < 5; i++) {\n  console.log("Regando una planta");\n}',
 ('j4','e2'): 'const paquetes = [3, 5, 2];\nlet total = 0;\nfor (const p of paquetes) {\n  total = total + p;\n}\nconsole.log(total);',
 ('j4','e3'): 'let litros = 0;\nwhile (litros < 5) {\n  litros++;\n  console.log("Litros: " + litros);\n}',
 ('j5','e1'): 'function cosechar() {\n  console.log("Cosecha lista");\n}\ncosechar();\ncosechar();',
 ('j5','e2'): 'function regar(planta) {\n  console.log("Regando", planta);\n}\nregar("zanahoria");',
 ('j5','e3'): 'function totalCosecha(plantas, frutosPorPlanta) {\n  return plantas * frutosPorPlanta;\n}',
 ('j6','e1'): 'function sumar(lista) {\n  let total = 0;\n  for (const n of lista) { total = total + n; }\n  return total;\n}',
 ('j6','e2'): 'function regarTodas(cantidad) {\n  for (let n = 1; n <= cantidad; n++) {\n    console.log("Regando la planta " + n);\n  }\n}',
 ('j6','e3'): 'function estaListo(dias, diasNecesarios) {\n  return dias >= diasNecesarios;\n}',
 ('j6','e4'): 'function cosechaTotal(plantas, regadas) {\n  return plantas + regadas;\n}',
 ('j6','e5'): 'for (let dia = 1; dia <= 5; dia++) {\n  if (dia % 2 === 0) {\n    console.log("Día " + dia + ": descanso");\n  } else {\n    console.log("Día " + dia + ": riego");\n  }\n}',
}
BAD = {
 ('h1','e1'): ["<p>Mi granja</p>", "<h2>Mi granja</h2>", "<h1>Otra cosa</h1>", "Mi granja"],
 ('h1','e2'): ["<h1>Mi granja</h1><p>corto</p>", "<h1>Mi granja</h1>"],
 ('h2','e1'): ["<ul><li>Zanahoria</li><li>Tomate</li></ul>", "<ol><li>Zanahoria</li><li>Tomate</li><li>Calabaza</li></ol>"],
 ('h3','e1'): ['<a href="http://ejemplo.com">Mi blog</a>', '<a>Mi blog</a>', '<a href="https://ejemplo.com">Otro</a>'],
 ('h3','e2'): ['<img src="tomate.png">', '<img src="otra.png" alt="Un tomate">'],
 ('h4','e2'): ["<main><section><h2>A</h2><p>uno</p></section></main>", "<section><h2>A</h2><p>x</p></section><section><h2>B</h2><p>y</p></section>"],
 ('h5','e1'): ['<html><head><title>Mi granja</title></head><body><h1>Hola</h1><p>Texto</p></body></html>', '<!DOCTYPE html><html><head><title>Otra</title></head><body><h1>Hola</h1><p>Texto</p></body></html>'],
 ('c1','e1'): ["h1 { color: red; }", "p { color: green; }", "h1 { background-color: green; }"],
 ('c1','e2'): ["p { font-size: 22px; }", "p { font-size: 12px; color: #d9453a; }"],
 ('c2','e1'): ["p { font-weight: bold; color: #d9453a; }", ".importante { font-weight: bold; }"],
 ('c2','e2'): ["h1 { text-align: center; color: #3d7ab8; }", "#titulo { color: #3d7ab8; }", "#titulo, h2 { text-align: center; color: #3d7ab8; }"],
 ('c3','e1'): [".tarjeta { padding: 20px; }", ".tarjeta { padding: 10px; border: 3px solid green; }"],
 ('c4','e1'): [".boton { background-color: #4caf50; color: white; }"],
 ('c4','e2'): [".sol { width: 80px; height: 80px; background-color: #f5d04c; }"],
 ('c5','e1'): [".fila { gap: 12px; }"],
 ('c5','e3'): [".tarjeta { padding: 4px; border-radius: 12px; background-color: #fff3b0; border: 2px solid #f08a24; }\n.tarjeta h2 { color: #d9731a; }", ".tarjeta { padding: 20px; border-radius: 12px; border: 2px solid #f08a24; }\n.tarjeta h2 { color: #d9731a; }"],
 ('j1','e1'): ["let semillas = 3;\nconsole.log(semillas);", "console.log(5);"],
 ('j1','e2'): ['let cultivo = "tomate";\nlet agua = 8;\nconsole.log(cultivo);\nconsole.log(agua);'],
 ('j2','e1'): ["let semillas = 3 + 4;\nconsole.log(semillas);"],
 ('j2','e2'): ['console.log("Ana cosechó 5 zanahorias");'],
 ('j3','e1'): ['console.log("Necesitas semillas");'],
 ('j3','e3'): ['let dias = 5;\nlet regada = true;\nif (dias >= 5) {\n  console.log("Lista para cosechar");\n} else {\n  console.log("Todavía no");\n}'],
 ('j4','e1'): ['console.log("Regando una planta");\n'*5, 'for (let i = 0; i < 4; i++) {\n  console.log("Regando una planta");\n}'],
 ('j4','e2'): ['const paquetes = [3, 5, 2];\nlet total = 0;\nconsole.log(10);'],
 ('j5','e1'): ['console.log("Cosecha lista");\nconsole.log("Cosecha lista");'],
 ('j5','e3'): ['function totalCosecha(a, b) {\n  return 12;\n}', 'function totalCosecha(a, b) {\n  console.log(a * b);\n}'],
 ('j6','e1'): ['function sumar(lista) {\n  return 10;\n}'],
 ('j6','e3'): ['function estaListo(d, n) {\n  return true;\n}'],
 ('j6','e5'): ['for (let d = 1; d <= 5; d++) {\n  console.log("Día " + d);\n}'],
}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':1280,'height':800}); logs=[]
    pg.on('console', lambda m: logs.append(m.type+': '+m.text) if 'ERR_NAME' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERROR: '+str(e)))
    pg.goto('file://' + os.path.join(ROOT, 'index.html')); pg.wait_for_timeout(600)
    fails=0
    JS_RUN = """async ([lid,eid,code])=>{const L=FC.LESSON_BY_ID(lid);const st=L.steps.find(s=>s.id===eid);const r=await FC.Check.run(code,st.check,null,{lang:L.lang,step:st});return {ok:r.ok,msgs:r.msgs,err:r.res&&r.res.error&&r.res.error.friendly}}"""
    for (lid,eid),code in H.items():
        r = pg.evaluate(JS_RUN,[lid,eid,code])
        if not r['ok']: fails+=1; print('SOL FAIL',lid,eid,r)
    for (lid,eid),codes in BAD.items():
        for code in codes:
            r = pg.evaluate(JS_RUN,[lid,eid,code])
            if r['ok']: fails+=1; print('BAD ACCEPTED',lid,eid,repr(code[:80]))
    # starters
    info = json.loads(pg.evaluate("JSON.stringify(FC.COURSE_ORDER.filter(c=>c!=='python').map(c=>FC.COURSES[c].lessons.map(l=>({id:l.id,steps:l.steps.filter(s=>s.type==='exercise').map(s=>s.id)}))).flat())"))
    missing=[(l['id'],e) for l in info for e in l['steps'] if (l['id'],e) not in H]
    print('ejercicios sin solución de prueba:', missing)
    for l in info:
        for e in l['steps']:
            r = pg.evaluate("""async ([lid,eid])=>{const L=FC.LESSON_BY_ID(lid);const st=L.steps.find(s=>s.id===eid);const r=await FC.Check.run(st.starter,st.check,null,{lang:L.lang,step:st});return r.ok}""",[l['id'],e])
            if r: fails+=1; print('STARTER PASSES',l['id'],e)
    # ejemplos de las lecciones 'learn' deben ejecutarse sin error
    bad = pg.evaluate("""async()=>{const out=[];for(const cid of ['js']){for(const L of FC.COURSES[cid].lessons)for(const s of L.steps){ if(s.type==='learn'&&s.code){const r=await FC.JSRun.run(s.code); if(r.error) out.push([L.id,s.title,r.error.friendly]);}}} return out}""")
    print('ejemplos JS con error (esperado: el de const si se modifica; aquí ninguno):', bad)
    print('FALLOS:', fails, '| ejercicios probados:', len(H))
    print('\n'.join(logs)); b.close()
