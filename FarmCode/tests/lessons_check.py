import json, os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOL = {
 ('l1','e1'): "semillas = 5\nprint(semillas)",
 ('l1','e2'): "semillas = 7\nprint(semillas)",
 ('l2','e1'): "semillas = 10\nagua = 7\nnombre_cultivo = \"tomate\"\nprint(semillas)\nprint(agua)\nprint(nombre_cultivo)",
 ('l2','e2'): "zanahorias = 4\ncalabazas = 2\nnombre_granja = \"Sol\"\nprint(zanahorias)\nprint(calabazas)\nprint(nombre_granja)",
 ('l3','e1'): "parcela_regada = True\nlitros_agua = 2.5\nprint(parcela_regada)\nprint(litros_agua)",
 ('l3','e2'): "semillas = 4\nagua = 2.5\ncultivo = \"maiz\"\nlisto = True",
 ('l4','e1'): "semillas = 3\nsemillas += 4\nprint(semillas)",
 ('l4','e2'): "semillas = 14\nsemillas = semillas - 5\npor_parcela = semillas / 3\nprint(por_parcela)",
 ('l5','e1'): "semillas = 0\nif semillas > 0:\n    print(\"Puedes sembrar\")\nelse:\n    print(\"Necesitas semillas\")",
 ('l5','e2'): "dias = 3\nif dias >= 5:\n    print(\"Lista para cosechar\")\nelse:\n    print(\"Todavía crece\")",
 ('l5','e3'): "agua = 5\nif agua < 3:\n    print(\"Necesita agua\")\nelif agua <= 7:\n    print(\"Agua perfecta\")\nelse:\n    print(\"Demasiada agua\")",
 ('l6','e1'): "for planta in range(5):\n    print(\"Regando una planta\")",
 ('l6','e2'): "for n in range(1, 6):\n    print(n)",
 ('l6','e3'): "litros = 0\nwhile litros < 5:\n    litros = litros + 1\n    print(\"Litros:\", litros)",
 ('l7','e1'): "def cosechar():\n    print(\"Cosecha lista\")\n\ncosechar()\ncosechar()",
 ('l7','e2'): "def regar(planta):\n    print(\"Regando\", planta)\n\nregar(\"zanahoria\")",
 ('l7','e3'): "def total_cosecha(plantas, frutos_por_planta):\n    return plantas * frutos_por_planta\n",
 ('l8','e1'): "paquetes = [3, 5, 2]\ntotal = 0\nfor paquete in paquetes:\n    total = total + paquete\nprint(total)",
 ('l8','e2'): "def regar_todas(cantidad):\n    for numero in range(1, cantidad + 1):\n        print(\"Regando la planta\", numero)\n",
 ('l8','e3'): "def esta_listo(dias, dias_necesarios):\n    if dias >= dias_necesarios:\n        return True\n    return False\n",
 ('l8','e4'): "def cosecha_total(plantas, regadas):\n    return plantas + regadas\n",
 ('l8','e5'): "for dia in range(1, 6):\n    if dia % 2 == 0:\n        print(\"Día\", str(dia) + \": descanso\")\n    else:\n        print(\"Día\", str(dia) + \": riego\")",
}
BAD = {
 ('l1','e1'): ["semillas = 3\nprint(semillas)", "print(5)", "semillas = '5'\nprint(semillas)"],
 ('l1','e2'): ["print(7)", "semilla = 7\nprint(semilla)"],
 ('l4','e1'): ["semillas = 3 + 4\nprint(semillas)", "semillas = 3\nprint(semillas)"],
 ('l4','e2'): ["print(3.0)", "semillas = 14\nsemillas = semillas - 5\npor_parcela = 3\nprint(por_parcela)"],
 ('l5','e1'): ["print('Necesitas semillas')", "semillas = 0\nif semillas > 0:\n    print('Necesitas semillas')\nelse:\n    print('Necesitas semillas')"],
 ('l5','e3'): ["agua = 5\nif agua < 3:\n    print('Necesita agua')\nelse:\n    print('Agua perfecta')"],
 ('l6','e1'): ["print('Regando una planta')\n"*5, "for i in range(4):\n    print('Regando una planta')"],
 ('l6','e3'): ["litros = 5\nprint('Litros: 1\\nLitros: 2')"],
 ('l7','e1'): ["print('Cosecha lista')\nprint('Cosecha lista')"],
 ('l7','e2'): ["def regar(planta):\n    print('Regando zanahoria')\nregar('zanahoria')"],
 ('l7','e3'): ["def total_cosecha(a, b):\n    return 12\n", "def total_cosecha(a, b):\n    print(a*b)\n"],
 ('l8','e1'): ["paquetes = [3, 5, 2]\ntotal = 0\nprint(10)", "paquetes = [3, 5, 2]\ntotal = 0\nfor p in paquetes:\n    total = 10\nprint(total)"],
 ('l8','e2'): ["def regar_todas(c):\n    print('Regando la planta 1')\n"],
 ('l8','e3'): ["def esta_listo(d, n):\n    return True\n"],
 ('l8','e5'): ["for d in range(1,6):\n    print('Día', d)"],
}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':1280,'height':800})
    logs=[]
    pg.on('console', lambda m: logs.append(m.type+': '+m.text) if 'ERR_NAME' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERROR: '+str(e)))
    pg.goto('file://' + os.path.join(ROOT, 'index.html')); pg.wait_for_timeout(500)
    fails=0
    for (lid,eid),code in SOL.items():
        r = pg.evaluate("""async ([lid,eid,code])=>{const L=FC.LESSON_BY_ID(lid);const st=L.steps.find(s=>s.id===eid);const r=await FC.Check.run(code,st.check);return {ok:r.ok,msgs:r.msgs,err:r.res&&r.res.error&&r.res.error.friendly}}""",[lid,eid,code])
        if not r['ok']: fails+=1; print('SOL FAIL',lid,eid,r)
    for (lid,eid),codes in BAD.items():
        for code in codes:
            r = pg.evaluate("""async ([lid,eid,code])=>{const L=FC.LESSON_BY_ID(lid);const st=L.steps.find(s=>s.id===eid);const r=await FC.Check.run(code,st.check);return {ok:r.ok,msgs:r.msgs}}""",[lid,eid,code])
            if r['ok']: fails+=1; print('BAD ACCEPTED',lid,eid,repr(code))
    # Starters no deben pasar
    for L in json.loads(pg.evaluate("JSON.stringify(FC.LESSONS.map(l=>({id:l.id,steps:l.steps.map(s=>({id:s.id,type:s.type,starter:s.starter}))})))")):
        for s in L['steps']:
            if s['type']=='exercise':
                r = pg.evaluate("""async ([lid,eid,code])=>{const L=FC.LESSON_BY_ID(lid);const st=L.steps.find(s=>s.id===eid);const r=await FC.Check.run(code,st.check);return r.ok}""",[L['id'],s['id'],s['starter']])
                if r and (L['id'],s['id']) not in [('l1','e1x')]: print('STARTER PASSES (revisar):',L['id'],s['id'])
    print('fallos',fails)
    print('\n'.join(logs))
    b.close()
