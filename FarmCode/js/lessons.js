/* ==========================================================
   lessons.js — El tutorial de Python («Huerto de Python»)
   Cada lección tiene pasos:
     learn    → explicación + ejemplo que se puede ejecutar y cambiar
     exercise → reto con comprobación REAL (se ejecuta el código)
     quiz     → pregunta rápida (sin castigo)
   Cómo se comprueba un ejercicio (campo "check"):
     stdout    salida exacta esperada del programa
     vars      valores que deben tener las variables al terminar
     types     tipos que deben tener (int, float, str, bool)
     requires  el código debe usar cierta idea (por ejemplo un for)
     variants  se cambia el valor de una variable y se vuelve a ejecutar
     cases     se añaden llamadas extra al final del código del jugador
     custom    función propia para casos especiales
   ========================================================== */
(function () {
    const FC = (window.FC = window.FC || {});

    FC.LESSONS = [
        /* ====================== 1 ====================== */
        {
            id: "l1", icon: "seed", title: "La semilla de Python", short: "Qué es una variable",
            blurb: "Conoce la semilla de Python y guarda tu primer dato.", xp: 30, reward: { seeds: { carrot: 2 } },
            steps: [
                {
                    type: "learn", title: "¡Bienvenido al Huerto de Python!", visual: "seed",
                    paras: [
                        "¡Bienvenido al Huerto de Python! Aquí aprenderás a programar cultivando tu granja.",
                        "Esta semilla representa un <b>dato</b>. Cuando la guardamos dentro de una <b>variable</b>, podemos darle un nombre y utilizarla después. A partir de una pequeña idea podemos crear muchas variables, guardar diferentes datos y construir programas cada vez más interesantes."
                    ],
                    note: "La semilla es un dibujo para ayudarte a imaginarlo. En Python, una variable es <b>un nombre asociado a un valor</b>."
                },
                {
                    type: "learn", title: "Tu primera variable", visual: "vars",
                    paras: [
                        "Mira este programa de dos líneas. Pulsa <b>Ejecutar</b> para verlo funcionar:",
                        "<code>semillas</code> es el <b>nombre</b> de la variable. <code>3</code> es el <b>valor</b> que guarda. El signo <code>=</code> significa «guarda este valor con este nombre».",
                        "<code>print(semillas)</code> le pide a Python que muestre lo que hay guardado."
                    ],
                    code: "semillas = 3\nprint(semillas)",
                    note: "Prueba a cambiar el <b>3</b> por un <b>5</b> y ejecuta otra vez. ¡Verás cinco semillas en el estante!"
                },
                {
                    type: "exercise", id: "e1", title: "Cambia el valor", concept: "Valor de una variable", xp: 10, visual: "vars",
                    goal: "Haz que el estante tenga <b>5 semillas</b>.",
                    starter: "semillas = 3\nprint(semillas)",
                    hints: ["Mira el número que está después del signo =.", "Cambia el 3 por otro número en la primera línea.", "La primera línea debe quedar: semillas = 5"],
                    check: { vars: { semillas: 5 }, stdout: "5" }
                },
                {
                    type: "quiz", title: "Pregunta rápida", question: "En la línea  semillas = 3  ¿qué es «semillas»?",
                    options: ["El valor guardado", "El nombre de la variable", "Un texto"], answer: 1,
                    explain: "¡Exacto! «semillas» es el nombre. El valor guardado es el 3."
                },
                {
                    type: "exercise", id: "e2", title: "Crea tu variable", concept: "Crear una variable", xp: 10, visual: "vars",
                    goal: "Crea una variable llamada <code>semillas</code> con el valor <b>7</b> y muéstrala con <code>print</code>.",
                    example: "semillas = 3\nprint(semillas)",
                    starter: "# Escribe tu código aquí\n",
                    hints: ["Primero el nombre, luego =, luego el valor.", "No olvides la segunda línea para mostrarla: print(semillas)", "Solución: semillas = 7  y después  print(semillas)"],
                    check: { vars: { semillas: 7 }, stdout: "7" }
                }
            ]
        },
        /* ====================== 2 ====================== */
        {
            id: "l2", icon: "drop", title: "Crear variables", short: "Varios datos con nombre",
            blurb: "Guarda semillas, agua y nombres de cultivos.", xp: 30, reward: { coins: 10 },
            steps: [
                {
                    type: "learn", title: "Muchas variables a la vez", visual: "vars",
                    paras: [
                        "Una granja necesita guardar muchas cosas: semillas, agua, nombres de cultivos… ¡Cada dato puede tener su propia variable!",
                        "Los <b>números</b> se escriben tal cual. Los <b>textos</b> van entre comillas, como <code>\"zanahoria\"</code>.",
                        "Para el nombre de una variable usa letras, números y guion bajo (<code>_</code>), sin espacios y sin empezar por un número. Las mayúsculas cuentan: <code>Agua</code> y <code>agua</code> son nombres distintos."
                    ],
                    code: "semillas = 3\nagua = 5\nnombre_cultivo = \"zanahoria\"\n\nprint(semillas)\nprint(agua)\nprint(nombre_cultivo)",
                    note: "Fíjate cómo cada variable tiene su propia caja en el estante."
                },
                {
                    type: "learn", title: "Una variable puede cambiar", visual: "vars",
                    paras: ["Se llaman «variables» porque su valor <b>puede variar</b>. Si vuelves a guardar algo con el mismo nombre, el valor nuevo reemplaza al anterior."],
                    code: "agua = 5\nprint(agua)\n\nagua = 8\nprint(agua)",
                    note: "Primero se muestra 5 y después 8. La variable es la misma, pero su valor cambió."
                },
                {
                    type: "exercise", id: "e1", title: "Modifica los valores", concept: "Cambiar valores", xp: 10, visual: "vars",
                    goal: "Tu granja necesita <b>10 semillas</b>, <b>7 de agua</b> y debe sembrar <b>tomate</b>.",
                    starter: "semillas = 3\nagua = 5\nnombre_cultivo = \"zanahoria\"\n\nprint(semillas)\nprint(agua)\nprint(nombre_cultivo)",
                    hints: ["Solo tienes que cambiar los valores que están después del =.", "El texto va entre comillas: \"tomate\"", "semillas = 10, agua = 7 y nombre_cultivo = \"tomate\""],
                    check: { vars: { semillas: 10, agua: 7, nombre_cultivo: "tomate" }, stdout: "10\n7\ntomate" }
                },
                {
                    type: "exercise", id: "e2", title: "Crea tres variables", concept: "Nombres de variables", xp: 10, visual: "vars",
                    goal: "Crea <code>zanahorias</code> con el valor <b>4</b>, <code>calabazas</code> con el valor <b>2</b> y <code>nombre_granja</code> con el nombre que quieras (un texto). Muestra las tres con <code>print</code>, en ese orden.",
                    starter: "# Crea tus tres variables y muéstralas\n",
                    hints: ["Escribe una línea por variable: nombre = valor", "El nombre de la granja es un texto, así que va entre comillas.", "zanahorias = 4\ncalabazas = 2\nnombre_granja = \"Sol Naciente\"\nprint(zanahorias) …"],
                    check: {
                        vars: { zanahorias: 4, calabazas: 2 }, types: { nombre_granja: "str" },
                        custom: (res) => {
                            const lines = res.stdout.trim().split("\n");
                            if (lines.length !== 3) return "Usa print tres veces: una por cada variable.";
                            if (lines[0].trim() !== "4" || lines[1].trim() !== "2") return "Muestra primero zanahorias, luego calabazas y al final nombre_granja.";
                            if (lines[2].trim() !== String(res.vars.nombre_granja && res.vars.nombre_granja.value)) return "La tercera línea debe mostrar el valor de nombre_granja.";
                            return null;
                        }
                    }
                },
                {
                    type: "quiz", title: "Pregunta rápida", question: "¿Cuál de estos es un nombre de variable válido?",
                    options: ["2semillas", "mis semillas", "mis_semillas"], answer: 2,
                    explain: "Correcto: no puede empezar con número ni tener espacios. El guion bajo reemplaza al espacio."
                }
            ]
        },
        /* ====================== 3 ====================== */
        {
            id: "l3", icon: "tomato", title: "Tipos de datos", short: "Enteros, decimales, textos y booleanos",
            blurb: "Aprende que no todos los datos son iguales.", xp: 35, reward: { seeds: { tomato: 2 } },
            steps: [
                {
                    type: "learn", title: "Cuatro tipos de datos", visual: "vars",
                    paras: [
                        "Cada dato tiene un <b>tipo</b>. Python lo usa para saber qué puede hacer con él:",
                        "• <b>Entero</b> (<code>int</code>): números sin decimales, como <code>3</code>.<br>• <b>Decimal</b> (<code>float</code>): números con punto, como <code>2.5</code>.<br>• <b>Texto</b> (<code>str</code>): entre comillas, como <code>\"zanahoria\"</code>.<br>• <b>Booleano</b> (<code>bool</code>): solo <code>True</code> (verdadero) o <code>False</code> (falso).",
                        "El booleano es perfecto para preguntas de sí o no: ¿la parcela está regada?"
                    ],
                    code: "semillas = 3\nagua = 2.5\ncultivo = \"zanahoria\"\nregada = True\n\nprint(type(semillas))\nprint(type(agua))\nprint(type(cultivo))\nprint(type(regada))",
                    note: "Los decimales llevan <b>punto</b>, no coma. Y <code>True</code> y <code>False</code> se escriben con la primera letra en mayúscula."
                },
                {
                    type: "learn", title: "Las comillas cambian todo", visual: "vars",
                    paras: [
                        "Un <code>3</code> y un <code>\"3\"</code> se ven parecidos, pero no son lo mismo: el primero es un número y el segundo es un texto.",
                        "Si sumas números, Python calcula. Si «sumas» textos, Python los pega uno detrás del otro."
                    ],
                    code: "print(3 + 3)\nprint(\"3\" + \"3\")",
                    note: "Ejecuta y compara: 6 contra 33."
                },
                {
                    type: "exercise", id: "e1", title: "La parcela está lista", concept: "Decimales y booleanos", xp: 10, visual: "vars",
                    goal: "Crea <code>parcela_regada</code> con el valor <code>True</code> y <code>litros_agua</code> con el valor <b>2.5</b>. Muestra las dos con <code>print</code>, en ese orden.",
                    starter: "# Crea las dos variables y muéstralas\n",
                    hints: ["Un booleano se escribe sin comillas: True", "El decimal usa punto: 2.5", "parcela_regada = True\nlitros_agua = 2.5\nprint(parcela_regada)\nprint(litros_agua)"],
                    check: { vars: { parcela_regada: true, litros_agua: 2.5 }, types: { parcela_regada: "bool", litros_agua: "float" }, stdout: "True\n2.5" }
                },
                {
                    type: "exercise", id: "e2", title: "Elige el tipo correcto", concept: "Los cuatro tipos", xp: 10, visual: "vars",
                    goal: "Crea cuatro variables, cada una de un tipo distinto:<br>• <code>semillas</code> (entero): 4<br>• <code>agua</code> (decimal): 2.5<br>• <code>cultivo</code> (texto): maiz<br>• <code>listo</code> (booleano): True",
                    starter: "# Escribe aquí tus cuatro variables\n",
                    hints: ["Entero: sin punto. Decimal: con punto. Texto: con comillas. Booleano: True o False.", "El texto debe ir entre comillas: \"maiz\"", "semillas = 4\nagua = 2.5\ncultivo = \"maiz\"\nlisto = True"],
                    check: {
                        vars: { semillas: 4, agua: 2.5, listo: true }, types: { semillas: "int", agua: "float", cultivo: "str", listo: "bool" },
                        custom: res => { const c = res.vars.cultivo && String(res.vars.cultivo.value).toLowerCase(); return c === "maiz" || c === "maíz" ? null : "La variable cultivo debe guardar el texto \"maiz\"."; }
                    }
                },
                {
                    type: "quiz", title: "Pregunta rápida", question: "Si escribes  listo = \"True\"  (con comillas), ¿qué tipo de dato es listo?",
                    options: ["Booleano", "Texto", "Número entero"], answer: 1,
                    explain: "¡Bien pensado! Todo lo que va entre comillas es texto, aunque parezca otra cosa."
                }
            ]
        },
        /* ====================== 4 ====================== */
        {
            id: "l4", icon: "coin", title: "Operaciones", short: "Sumar, restar, multiplicar y dividir",
            blurb: "Haz cuentas con tus semillas y cosechas.", xp: 40, reward: { coins: 15 },
            steps: [
                {
                    type: "learn", title: "Hacer cuentas", visual: "vars",
                    paras: [
                        "Python puede hacer operaciones: <code>+</code> suma, <code>-</code> resta, <code>*</code> multiplica y <code>/</code> divide.",
                        "Lo más importante: Python primero <b>calcula lo de la derecha</b> y después lo guarda en la variable de la izquierda. En este ejemplo calcula <code>3 + 2 = 5</code> y guarda el 5 en <code>semillas</code>."
                    ],
                    code: "semillas = 3\nsemillas = semillas + 2\n\nprint(semillas)",
                    note: "Ahora tienes cinco semillas. Mira cómo cambia el estante."
                },
                {
                    type: "learn", title: "Más operaciones", visual: "vars",
                    paras: [
                        "Puedes usar varias variables en una misma cuenta. También existe una forma corta: <code>semillas += 2</code> significa «suma 2 a semillas».",
                        "Dos extras muy útiles: <code>//</code> divide y se queda con la parte entera, y <code>%</code> te da lo que sobra de una división (el resto)."
                    ],
                    code: "paquetes = 4\nsemillas_por_paquete = 3\ntotal = paquetes * semillas_por_paquete\nprint(total)\n\ntotal += 1\nprint(total)\n\nprint(total // 5)\nprint(total % 5)",
                    note: "13 dividido entre 5 es 2 y sobran 3. Por eso se muestran 2 y 3."
                },
                {
                    type: "exercise", id: "e1", title: "Compra semillas", concept: "Sumar a una variable", xp: 10, visual: "vars",
                    goal: "Tienes 3 semillas y compras <b>4 más</b>. Actualiza la variable <code>semillas</code> usando una suma y muestra el resultado (debe salir 7).",
                    starter: "semillas = 3\n\n# Compras 4 semillas más:\n\nprint(semillas)",
                    hints: ["Usa la variable en la cuenta: semillas = semillas + ...", "Suma 4 a lo que ya tienes.", "semillas = semillas + 4   (o también: semillas += 4)"],
                    check: {
                        vars: { semillas: 7 }, stdout: "7",
                        requires: [{ re: /semillas\s*(\+=\s*4|=\s*semillas\s*\+\s*4|=\s*4\s*\+\s*semillas)/, msg: "Usa la variable semillas en la cuenta, por ejemplo: semillas = semillas + 4" }]
                    }
                },
                {
                    type: "exercise", id: "e2", title: "Siembra y reparte", concept: "Restar y dividir", xp: 15, visual: "vars",
                    goal: "Tienes 14 semillas. <b>Siembras 5</b> y luego <b>reparte las que quedan entre 3 parcelas</b>. Guarda el resultado en <code>por_parcela</code> y muéstralo.",
                    starter: "semillas = 14\n\n# 1) Siembras 5 semillas\n\n# 2) Reparte las que quedan entre 3 parcelas (guárdalo en por_parcela)\n\nprint(por_parcela)",
                    hints: ["Primero resta: semillas = semillas - 5", "Después divide: por_parcela = semillas / 3", "semillas = semillas - 5\npor_parcela = semillas / 3"],
                    check: {
                        vars: { semillas: 9, por_parcela: 3 },
                        requires: [{ re: /-/, msg: "Usa una resta para sembrar las 5 semillas." }, { re: /\//, msg: "Usa una división para repartir entre las 3 parcelas." }],
                        custom: res => { const l = res.stdout.trim(); return l === "3" || l === "3.0" ? null : "print(por_parcela) debe mostrar 3.0 (o 3)."; }
                    }
                },
                {
                    type: "quiz", title: "Pregunta rápida", question: "Si  semillas = 2  y luego escribes  semillas = semillas * 3 ,  ¿cuánto vale semillas?",
                    options: ["5", "6", "23"], answer: 1,
                    explain: "Python calcula 2 * 3 = 6 y guarda el 6 en semillas."
                }
            ]
        },
        /* ====================== 5 ====================== */
        {
            id: "l5", icon: "check", title: "Condicionales", short: "Tomar decisiones con if y else",
            blurb: "Enseña a tu programa a decidir.", xp: 50, reward: { seeds: { carrot: 3 } },
            steps: [
                {
                    type: "learn", title: "Si pasa esto, haz aquello", visual: "speech",
                    paras: [
                        "Los programas pueden tomar decisiones con <code>if</code> (si) y <code>else</code> (si no). Observa:",
                        "Python mira la condición <code>semillas &gt; 0</code>. Si es <b>verdadera</b>, hace lo que está debajo del <code>if</code>. Si es <b>falsa</b>, hace lo que está debajo del <code>else</code>.",
                        "Las líneas que dependen de la decisión llevan <b>4 espacios</b> al inicio (la sangría), y el <code>if</code> y el <code>else</code> terminan con dos puntos <code>:</code>."
                    ],
                    code: "semillas = 3\n\nif semillas > 0:\n    print(\"Puedes sembrar\")\nelse:\n    print(\"Necesitas semillas\")",
                    note: "Cambia <b>semillas = 3</b> por <b>semillas = 0</b> y ejecuta otra vez. ¡El programa decide distinto!"
                },
                {
                    type: "learn", title: "Comparar y elegir entre varias opciones", visual: "speech",
                    paras: [
                        "Para comparar: <code>&gt;</code> mayor, <code>&lt;</code> menor, <code>&gt;=</code> mayor o igual, <code>&lt;=</code> menor o igual, <code>==</code> igual y <code>!=</code> distinto.",
                        "Cuidado: <code>=</code> <b>guarda</b> un valor, pero <code>==</code> <b>compara</b> dos valores.",
                        "Si hay más de dos caminos usa <code>elif</code> (significa «si no, y si…»):"
                    ],
                    code: "agua = 4\n\nif agua >= 8:\n    print(\"La planta está feliz\")\nelif agua >= 3:\n    print(\"Está bien, pero puede beber más\")\nelse:\n    print(\"¡Tiene sed!\")",
                    note: "Prueba con agua = 1, agua = 5 y agua = 10."
                },
                {
                    type: "exercise", id: "e1", title: "¿Puedes sembrar?", concept: "if y else", xp: 10, visual: "speech",
                    goal: "Si tienes semillas (<code>semillas &gt; 0</code>) muestra <b>Puedes sembrar</b>. Si no, muestra <b>Necesitas semillas</b>. Probaremos tu programa con varios valores.",
                    starter: "semillas = 0\n\n# Escribe aquí tu if / else\n",
                    hints: ["Empieza con: if semillas > 0:", "Debajo del if, con 4 espacios, va el print de «Puedes sembrar». No olvides el else:", "if semillas > 0:\n    print(\"Puedes sembrar\")\nelse:\n    print(\"Necesitas semillas\")"],
                    check: {
                        variants: [{ set: { semillas: "0" }, stdout: "Necesitas semillas" }, { set: { semillas: "5" }, stdout: "Puedes sembrar" }, { set: { semillas: "1" }, stdout: "Puedes sembrar" }],
                        requires: [{ re: /\bif\b/, msg: "Usa un if para decidir." }]
                    }
                },
                {
                    type: "exercise", id: "e2", title: "¿Está lista la planta?", concept: "Comparaciones", xp: 10, visual: "speech",
                    goal: "Una planta necesita <b>5 días</b> para crecer. Si <code>dias</code> es 5 o más, muestra <b>Lista para cosechar</b>; si no, muestra <b>Todavía crece</b>.",
                    starter: "dias = 3\n\n# Decide si ya se puede cosechar\n",
                    hints: ["«5 o más» se escribe con >=", "if dias >= 5:", "if dias >= 5:\n    print(\"Lista para cosechar\")\nelse:\n    print(\"Todavía crece\")"],
                    check: {
                        variants: [{ set: { dias: "3" }, stdout: "Todavía crece" }, { set: { dias: "5" }, stdout: "Lista para cosechar" }, { set: { dias: "9" }, stdout: "Lista para cosechar" }, { set: { dias: "4" }, stdout: "Todavía crece" }],
                        requires: [{ re: /\bif\b/, msg: "Usa un if para decidir." }]
                    }
                },
                {
                    type: "exercise", id: "e3", title: "Riego inteligente", concept: "elif", xp: 15, visual: "speech",
                    goal: "Según el <code>agua</code> de la parcela:<br>• menos de 3 → <b>Necesita agua</b><br>• de 3 a 7 → <b>Agua perfecta</b><br>• más de 7 → <b>Demasiada agua</b>",
                    starter: "agua = 5\n\n# Usa if, elif y else\n",
                    hints: ["Tienes tres caminos, así que necesitas if, elif y else.", "if agua < 3: … elif agua <= 7: … else: …", "if agua < 3:\n    print(\"Necesita agua\")\nelif agua <= 7:\n    print(\"Agua perfecta\")\nelse:\n    print(\"Demasiada agua\")"],
                    check: {
                        variants: [{ set: { agua: "1" }, stdout: "Necesita agua" }, { set: { agua: "3" }, stdout: "Agua perfecta" }, { set: { agua: "7" }, stdout: "Agua perfecta" }, { set: { agua: "8" }, stdout: "Demasiada agua" }, { set: { agua: "2" }, stdout: "Necesita agua" }],
                        requires: [{ re: /\belif\b/, msg: "Usa elif para el camino del medio." }]
                    }
                },
                {
                    type: "quiz", title: "Pregunta rápida", question: "¿Cuál compara dos valores?",
                    options: ["semillas = 3", "semillas == 3", "semillas => 3"], answer: 1,
                    explain: "Dos signos == comparan. Un solo = guarda un valor."
                }
            ]
        },
        /* ====================== 6 ====================== */
        {
            id: "l6", icon: "heart", title: "Ciclos", short: "Repetir tareas con for y while",
            blurb: "Riega muchas plantas sin repetir el código.", xp: 50, reward: { coins: 20 },
            steps: [
                {
                    type: "learn", title: "Repetir con for", visual: "loop",
                    paras: [
                        "Imagina regar 100 plantas escribiendo 100 veces la misma línea. ¡Qué cansancio! Con un <b>ciclo</b> le dices a Python que repita una tarea.",
                        "<code>range(3)</code> produce tres vueltas. En cada vuelta Python ejecuta las líneas que tienen sangría debajo del <code>for</code>."
                    ],
                    code: "for planta in range(3):\n    print(\"Regando una planta\")",
                    note: "Mira cómo la gota cae sobre cada planta, una tras otra. Prueba cambiar el 3 por un 5."
                },
                {
                    type: "learn", title: "Contar vueltas", visual: "loop",
                    paras: [
                        "La variable del ciclo (aquí <code>numero</code>) cambia en cada vuelta. <code>range(1, 4)</code> cuenta desde 1 <b>hasta el 3</b>: el número final nunca se incluye."
                    ],
                    code: "for numero in range(1, 4):\n    print(\"Planta número\", numero)",
                    note: "Sale 1, 2 y 3. Para llegar hasta el 5 necesitas range(1, 6)."
                },
                {
                    type: "exercise", id: "e1", title: "Riega cinco plantas", concept: "for con range", xp: 10, visual: "loop",
                    goal: "Usa un ciclo <code>for</code> para mostrar <b>Regando una planta</b> exactamente 5 veces.",
                    starter: "# Escribe tu ciclo aquí\n",
                    hints: ["Empieza con: for planta in range(...):", "El número dentro de range es cuántas veces se repite.", "for planta in range(5):\n    print(\"Regando una planta\")"],
                    check: { stdout: "Regando una planta\n".repeat(5).trim(), requires: [{ re: /\bfor\b[\s\S]*\brange\b/, msg: "Usa un ciclo for con range, en vez de escribir el print cinco veces." }] }
                },
                {
                    type: "exercise", id: "e2", title: "Cuenta las semillas", concept: "range(inicio, fin)", xp: 10, visual: "loop",
                    goal: "Muestra los números del <b>1 al 5</b>, uno por línea, usando un ciclo <code>for</code>.",
                    starter: "# Cuenta del 1 al 5\n",
                    hints: ["Quieres empezar en 1.", "Recuerda que el final de range no se incluye: para llegar al 5, termina en 6.", "for numero in range(1, 6):\n    print(numero)"],
                    check: { stdout: "1\n2\n3\n4\n5", requires: [{ re: /\bfor\b/, msg: "Usa un ciclo for." }] }
                },
                {
                    type: "learn", title: "Repetir mientras se cumpla algo", visual: "loop",
                    paras: [
                        "El ciclo <code>while</code> (mientras) repite <b>mientras la condición sea verdadera</b>. Es ideal cuando no sabes cuántas vueltas harán falta.",
                        "<b>Cuidado:</b> dentro del ciclo algo debe cambiar para que la condición llegue a ser falsa. Si no, ¡se repetiría para siempre! No te preocupes: este juego corta los programas que tardan demasiado."
                    ],
                    code: "agua = 0\nwhile agua < 3:\n    agua = agua + 1\n    print(\"Echando agua:\", agua)",
                    note: "En cada vuelta <code>agua</code> sube 1. Cuando llega a 3, la condición ya no se cumple y el ciclo termina."
                },
                {
                    type: "exercise", id: "e3", title: "Llena el balde", concept: "while", xp: 15, visual: "loop",
                    goal: "El balde está vacío. Con un ciclo <code>while</code>, echa <b>un litro cada vez</b> hasta llegar a 5 litros y muestra <b>Litros: 1</b>, <b>Litros: 2</b>… hasta <b>Litros: 5</b>.",
                    starter: "litros = 0\n\n# Llena el balde con un while\n",
                    hints: ["La condición puede ser: while litros < 5:", "Dentro del ciclo suma 1 a litros y muestra el mensaje.", "while litros < 5:\n    litros = litros + 1\n    print(\"Litros:\", litros)"],
                    check: { stdout: "Litros: 1\nLitros: 2\nLitros: 3\nLitros: 4\nLitros: 5", vars: { litros: 5 }, requires: [{ re: /\bwhile\b/, msg: "Usa un ciclo while." }] }
                },
                {
                    type: "quiz", title: "Pregunta rápida", question: "¿Cuántas veces se repite  for x in range(3):  ?",
                    options: ["2 veces", "3 veces", "4 veces"], answer: 1,
                    explain: "range(3) produce tres vueltas: 0, 1 y 2."
                }
            ]
        },
        /* ====================== 7 ====================== */
        {
            id: "l7", icon: "book", title: "Funciones", short: "Agrupar instrucciones para reutilizarlas",
            blurb: "Crea tus propias herramientas de granja.", xp: 50, reward: { seeds: { pumpkin: 2 } },
            steps: [
                {
                    type: "learn", title: "Tu propia herramienta", visual: "function",
                    paras: [
                        "Una <b>función</b> agrupa varias instrucciones bajo un nombre, como una receta. Se <b>define</b> una vez con <code>def</code> y se puede <b>llamar</b> cuantas veces quieras.",
                        "Definir una función no la ejecuta: solo guarda la receta. La función trabaja cuando la llamas escribiendo su nombre con paréntesis."
                    ],
                    code: "def regar_planta():\n    print(\"Planta regada\")\n\nregar_planta()\nregar_planta()",
                    note: "La receta se escribió una vez, pero se usó dos veces."
                },
                {
                    type: "learn", title: "Datos de entrada y resultados", visual: "function",
                    paras: [
                        "Una función puede recibir datos (los <b>parámetros</b>, entre paréntesis) y devolver un resultado con <code>return</code>.",
                        "Aquí la función recibe cuántos paquetes tienes y cuántas semillas trae cada uno, y <b>devuelve</b> el total."
                    ],
                    code: "def total_semillas(paquetes, por_paquete):\n    return paquetes * por_paquete\n\nprint(total_semillas(3, 4))\nprint(total_semillas(5, 2))",
                    note: "Con la misma función obtienes 12 y 10: ¡la reutilizas con datos distintos!"
                },
                {
                    type: "exercise", id: "e1", title: "Tu primera función", concept: "def y llamar", xp: 10, visual: "function",
                    goal: "Define una función llamada <code>cosechar</code> que muestre <b>Cosecha lista</b>. Después llámala dos veces.",
                    starter: "# Define la función y llámala dos veces\n",
                    hints: ["Empieza con: def cosechar():", "Dentro (con sangría) va el print de «Cosecha lista».", "def cosechar():\n    print(\"Cosecha lista\")\n\ncosechar()\ncosechar()"],
                    check: {
                        stdout: "Cosecha lista\nCosecha lista",
                        requires: [{ re: /def\s+cosechar\s*\(\s*\)\s*:/, msg: "Define la función con: def cosechar():" }],
                        cases: [{ append: "cosechar()\ncosechar()\ncosechar()", stdout: "Cosecha lista\nCosecha lista\nCosecha lista", msg: "Tu función debe mostrar «Cosecha lista» cada vez que se llama." }]
                    }
                },
                {
                    type: "exercise", id: "e2", title: "Función con parámetro", concept: "Parámetros", xp: 15, visual: "function",
                    goal: "Completa la función <code>regar(planta)</code>: debe mostrar <b>Regando</b> seguido del nombre de la planta. Por ejemplo, <code>regar(\"tomate\")</code> muestra <b>Regando tomate</b>.",
                    starter: "def regar(planta):\n    # muestra «Regando» y el nombre de la planta\n    pass\n\nregar(\"zanahoria\")",
                    hints: ["Dentro de print puedes poner dos datos separados por coma.", "print(\"Regando\", planta)", "def regar(planta):\n    print(\"Regando\", planta)"],
                    check: {
                        stdout: "Regando zanahoria",
                        cases: [{ append: "regar(\"maíz\")", stdout: "Regando maíz" }, { append: "regar(\"calabaza\")", stdout: "Regando calabaza" }]
                    }
                },
                {
                    type: "exercise", id: "e3", title: "Calcula con return", concept: "return", xp: 15, visual: "function",
                    goal: "Escribe la función <code>total_cosecha(plantas, frutos_por_planta)</code> que <b>devuelva</b> cuántos frutos habrá en total. Probaremos con varios números.",
                    starter: "def total_cosecha(plantas, frutos_por_planta):\n    # devuelve el total de frutos\n    pass\n",
                    hints: ["El total se calcula multiplicando.", "Usa return para devolver el resultado.", "def total_cosecha(plantas, frutos_por_planta):\n    return plantas * frutos_por_planta"],
                    check: {
                        requires: [{ re: /\breturn\b/, msg: "Usa return para devolver el resultado." }],
                        cases: [{ append: "print(total_cosecha(3, 4))", stdout: "12" }, { append: "print(total_cosecha(5, 2))", stdout: "10" }, { append: "print(total_cosecha(0, 9))", stdout: "0" }, { append: "print(total_cosecha(7, 7))", stdout: "49" }]
                    }
                },
                {
                    type: "quiz", title: "Pregunta rápida", question: "¿Qué hace la palabra return dentro de una función?",
                    options: ["Repite la función", "Devuelve un resultado a quien la llamó", "Borra las variables"], answer: 1,
                    explain: "return entrega el resultado de la función para que puedas guardarlo o mostrarlo."
                }
            ]
        },
        /* ====================== 8 ====================== */
        {
            id: "l8", icon: "trophy", title: "Pequeños programas", short: "Automatiza tu granja",
            blurb: "Combina todo lo aprendido en retos de granja.", xp: 80, reward: { coins: 40 },
            steps: [
                {
                    type: "learn", title: "Todo junto", visual: "loop",
                    paras: [
                        "¡Llegó la hora de combinar variables, condiciones, ciclos y funciones para automatizar tu granja!",
                        "Un dato nuevo: una <b>lista</b> guarda varios valores entre corchetes, por ejemplo <code>[3, 5, 2]</code>. Un <code>for</code> puede recorrer la lista uno por uno.",
                        "Este programa usa una función con un ciclo para regar varias plantas:"
                    ],
                    code: "def regar_todas(cantidad):\n    for numero in range(1, cantidad + 1):\n        print(\"Regando la planta\", numero)\n\nregar_todas(3)\n\nsemillas = [3, 5, 2]\nfor paquete in semillas:\n    print(\"Paquete con\", paquete)",
                    note: "Cuatro herramientas trabajando juntas. ¡Ahora te toca a ti!"
                },
                {
                    type: "exercise", id: "e1", title: "Contar semillas", concept: "Ciclo + variable acumuladora", xp: 15, visual: "vars",
                    goal: "Tienes varios paquetes de semillas en la lista <code>paquetes</code>. Usa un ciclo <code>for</code> para sumar todas las semillas en <code>total</code> y mostrarlo. (Probaremos con otras listas.)",
                    starter: "paquetes = [3, 5, 2]\ntotal = 0\n\n# Recorre la lista y suma cada paquete a total\n\nprint(total)",
                    hints: ["Recorre la lista: for paquete in paquetes:", "Dentro del ciclo: total = total + paquete", "for paquete in paquetes:\n    total = total + paquete"],
                    check: {
                        variants: [{ set: { paquetes: "[3, 5, 2]" }, stdout: "10" }, { set: { paquetes: "[1, 1, 1, 1]" }, stdout: "4" }, { set: { paquetes: "[10]" }, stdout: "10" }, { set: { paquetes: "[7, 8, 9, 1]" }, stdout: "25" }],
                        requires: [{ re: /\bfor\b/, msg: "Usa un ciclo for para recorrer la lista." }]
                    }
                },
                {
                    type: "exercise", id: "e2", title: "Regar varias plantas", concept: "Función + ciclo", xp: 15, visual: "loop",
                    goal: "Escribe la función <code>regar_todas(cantidad)</code>: debe mostrar <b>Regando la planta 1</b>, <b>Regando la planta 2</b>… hasta la cantidad indicada.",
                    starter: "def regar_todas(cantidad):\n    # usa un ciclo for\n    pass\n",
                    hints: ["Dentro de la función necesitas un for.", "range(1, cantidad + 1) cuenta de 1 hasta cantidad.", "def regar_todas(cantidad):\n    for numero in range(1, cantidad + 1):\n        print(\"Regando la planta\", numero)"],
                    check: {
                        requires: [{ re: /\bfor\b/, msg: "Usa un ciclo for dentro de la función." }],
                        cases: [{ append: "regar_todas(3)", stdout: "Regando la planta 1\nRegando la planta 2\nRegando la planta 3" }, { append: "regar_todas(1)", stdout: "Regando la planta 1" }, { append: "regar_todas(5)", stdout: "Regando la planta 1\nRegando la planta 2\nRegando la planta 3\nRegando la planta 4\nRegando la planta 5" }]
                    }
                },
                {
                    type: "exercise", id: "e3", title: "¿El cultivo está listo?", concept: "Función + condición", xp: 15, visual: "speech",
                    goal: "Escribe <code>esta_listo(dias, dias_necesarios)</code>. Debe <b>devolver</b> <code>True</code> si ya pasaron los días necesarios (o más) y <code>False</code> si no.",
                    starter: "def esta_listo(dias, dias_necesarios):\n    # devuelve True o False\n    pass\n",
                    hints: ["Compara dias con dias_necesarios.", "Puedes usar un if con return True y return False.", "def esta_listo(dias, dias_necesarios):\n    if dias >= dias_necesarios:\n        return True\n    return False"],
                    check: {
                        requires: [{ re: /\breturn\b/, msg: "Usa return para devolver True o False." }],
                        cases: [{ append: "print(esta_listo(5, 5))", stdout: "True" }, { append: "print(esta_listo(2, 5))", stdout: "False" }, { append: "print(esta_listo(9, 3))", stdout: "True" }, { append: "print(esta_listo(0, 1))", stdout: "False" }]
                    }
                },
                {
                    type: "exercise", id: "e4", title: "Calcula las cosechas", concept: "Operaciones en una función", xp: 15, visual: "function",
                    goal: "En la granja, cada planta da <b>1 fruto</b> y cada planta <b>regada</b> da <b>1 fruto extra</b>. Escribe <code>cosecha_total(plantas, regadas)</code> que devuelva el total de frutos.",
                    starter: "def cosecha_total(plantas, regadas):\n    pass\n",
                    hints: ["Cada planta da 1: ya tienes «plantas» frutos.", "Los frutos extra son tantos como plantas regadas.", "def cosecha_total(plantas, regadas):\n    return plantas + regadas"],
                    check: {
                        requires: [{ re: /\breturn\b/, msg: "Usa return para devolver el total." }],
                        cases: [{ append: "print(cosecha_total(5, 2))", stdout: "7" }, { append: "print(cosecha_total(3, 3))", stdout: "6" }, { append: "print(cosecha_total(4, 0))", stdout: "4" }, { append: "print(cosecha_total(0, 0))", stdout: "0" }]
                    }
                },
                {
                    type: "exercise", id: "e5", title: "Automatiza una tarea", concept: "Ciclo + condición", xp: 20, visual: "loop",
                    goal: "Planifica 5 días de trabajo. Con un ciclo, muestra para cada día del 1 al 5: <b>Día 1: riego</b> si el día es impar, o <b>Día 2: descanso</b> si es par.<br>Pista de matemáticas: un número es par si <code>dia % 2 == 0</code>.",
                    starter: "# Automatiza la semana de trabajo\n",
                    hints: ["Necesitas un for dia in range(1, 6): y, dentro, un if/else.", "if dia % 2 == 0: descanso, si no: riego. Usa print(\"Día\", dia, \"...\")", "for dia in range(1, 6):\n    if dia % 2 == 0:\n        print(\"Día\", str(dia) + \": descanso\")\n    else:\n        print(\"Día\", str(dia) + \": riego\")"],
                    check: {
                        stdout: "Día 1: riego\nDía 2: descanso\nDía 3: riego\nDía 4: descanso\nDía 5: riego",
                        requires: [{ re: /\bfor\b/, msg: "Usa un ciclo for." }, { re: /\bif\b/, msg: "Usa un if para decidir entre riego y descanso." }]
                    }
                }
            ]
        }
    ];

    /* ---------- Cursos ---------- */
    FC.COURSES = {}; FC.COURSE_ORDER = [];
    // Registra un curso y marca cada lección con su curso y su lenguaje.
    FC.registerCourse = function (c) {
        c.lessons.forEach(l => { l.course = c.id; l.lang = c.lang; });
        FC.COURSES[c.id] = c;
        if (!FC.COURSE_ORDER.includes(c.id)) FC.COURSE_ORDER.push(c.id);
    };
    FC.LESSON_BY_ID = id => { for (const cid of FC.COURSE_ORDER) { const l = FC.COURSES[cid].lessons.find(x => x.id === id); if (l) return l; } return null; };
    FC.registerCourse({
        id: "python", name: "Huerto de Python", short: "Python", icon: "snake", minLevel: 1, lang: "python", area: null,
        intro: "¡Bienvenido al Huerto de Python! Aprende a programar paso a paso: cada lección te explica una idea, te deja probarla y te propone retos. No hay castigos por equivocarse: ¡se aprende probando!",
        lessons: FC.LESSONS
    });
})();
