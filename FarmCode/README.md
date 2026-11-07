# Farm Code 🌱

Videojuego educativo de granja en pixel art donde se aprende **Python, HTML, CSS y JavaScript** desde cero.
Al abrirlo ves directamente la granja y puedes caminar por ella; todo lo demás está en el menú ☰.
Desde la granja se camina a **tres zonas que se exploran** (una por lenguaje) y que cambian a medida que aprendes.

## Cómo ejecutarlo

**Opción fácil:** abre `index.html` con doble clic (Chrome, Edge, Firefox o Safari).

**Opción recomendada** (por si tu navegador limita archivos locales):-

```bash
cd FarmCode
python3 -m http.server 8000
# abre http://localhost:8000
```

No hay que instalar nada: no usa Node, npm ni librerías. Los gráficos se dibujan por código (no hay imágenes) y los sonidos se sintetizan.
Solo las tipografías (Google Fonts: *Press Start 2P* y *Nunito*) vienen de internet; si no hay conexión el juego usa tipos de letra del sistema y funciona igual.

## Controles

| Acción | Teclado | Celular |
|---|---|---|
| Caminar | W A S D o flechas (Shift corre) | cruz de la izquierda |
| Interactuar (sembrar, regar, cosechar, hablar) | E, Espacio o Enter | botón **A** |
| Elegir semilla | 1 · 2 · 3 | tocar la barra de semillas |
| Menú | botón ☰ · **Esc** cierra | botón ☰ |

## Diagnóstico del proyecto original (Etapa 1)

El adelanto que recibí tenía `index.html`, `css/style.css` y `js/main.js` (~700 líneas).

**Funcionaba:** menú hamburguesa, pantallas de personaje, mascotas y misiones, la idea de las «zonas» de aprendizaje, progreso en `localStorage`.

**Necesitaba mejoras:** la granja eran rectángulos y emojis dentro de una página con título (no ocupaba la pantalla); el personaje no se movía; las 2 misiones se «validaban» buscando palabras con una expresión regular (no ejecutaba Python); no había cámara, colisiones, cultivos ni controles táctiles.

**Faltaba:** pixel art, movimiento y colisiones, agricultura, inventario, XP/niveles/logros, tutorial de Python completo, ejecución real de código, personalización real, comunidad, cuentas y backend.

Conservé lo útil (estructura del menú, secciones, textos de las zonas de aprendizaje, lectura del progreso anterior si existía) y reconstruí el núcleo.

## Qué está hecho y probado

| Etapa | Estado |
|---|---|
| 2 · Granja, movimiento, colisiones, cámara, interacción | ✅ hecho y probado |
| 3 · Menú hamburguesa y 10 secciones independientes | ✅ hecho y probado |
| 4 · Registro / inicio de sesión | ⏸️ **en pausa a pedido tuyo** (ver abajo) |
| 5 · Tutorial de Python (8 lecciones, 20 retos) | ✅ hecho y probado |
| 6 · Agricultura e inventario | ✅ hecho y probado |
| 7 · Misiones, XP, niveles, logros, ventanas | ✅ hecho y probado |
| 8 · Personaje y mascotas | ✅ hecho y probado |
| 9 · Comunidad | ⏸️ **pantalla informativa; la comunidad real necesita backend** |
| 10 · Pruebas y preparación | ✅ pruebas automáticas y este README |
| 11 · Zonas de aprendizaje: HTML, CSS y JavaScript | ✅ hecho y probado (ver abajo) |

### Zonas de aprendizaje (nuevo)

Desde la granja se sale caminando por los bordes del mapa. Cada zona pide un **nivel** (si no lo tienes, el letrero muestra un candado y el paso está cerrado):

| Zona | Cómo llegar | Nivel | Qué cambia al aprender |
|---|---|---|---|
| **Taller de Construcción HTML** | camino del sur | 2 | una casa se va construyendo: cimientos → estructura → paredes → esqueleto del techo → tejas → puerta, ventanas y chimenea |
| **Invernadero CSS** | camino del oeste | 3 | las macetas pasan de grises y marchitas a pintadas y floridas; el cuadro del caballete se va completando |
| **Campo de Máquinas JavaScript** | camino del este | 4 | se encienden las farolas, la bomba de agua, los aspersores (y crecen los cultivos), la cinta transportadora, el molino y un espantapájaros robot |

En cada zona hay un maestro con el que hablar (cambia lo que dice según tu avance) y una mesa/terminal que abre el curso. También se puede entrar a los cursos desde el menú → Programación (pestañas Python · HTML · CSS · JavaScript).

**Cursos nuevos (16 lecciones, 39 retos):**
- **HTML (5 lecciones):** etiquetas, listas y énfasis, enlaces e imágenes, estructura de la página y proyecto de página completa. El editor tiene el HTML y una vista previa muestra la página.
- **CSS (5 lecciones):** colores y texto, selectores, modelo de caja, fondos y formas, flexbox y proyecto. El HTML va fijo y tú escribes solo el CSS.
- **JavaScript (6 lecciones):** variables y `console.log`, tipos y operaciones, condicionales, ciclos y arreglos, funciones y pequeños programas.

**Cómo se comprueban:** en HTML la página se dibuja en un iframe oculto y se examina su estructura real (`querySelectorAll`); en CSS se leen los estilos realmente aplicados (`getComputedStyle`), así `red` y `rgb(255, 0, 0)` cuentan igual y no importa cómo escribas la regla. En JavaScript el código se ejecuta y se comprueba igual que en Python (salida, variables, valores distintos y llamadas ocultas).

**Seguridad de la ejecución:** la vista previa de HTML/CSS está en un iframe con `sandbox` sin scripts, con una política CSP que bloquea la red y las imágenes externas. El JavaScript del jugador corre en un Web Worker con la red desactivada y un límite de 2 s (un ciclo infinito se corta sin congelar el juego).

### Lo que hay

- **Granja** 32×24 casillas: casa, mercado, tablón de misiones, pozo de consejos, estanque, letrero del Huerto de Python, dos huertos cercados (8 parcelas cada uno) y bosque. El huerto avanzado está tras un portón que se abre en el **nivel 3**.
- **Cultivos:** zanahoria (30 s), tomate (60 s, nivel 2) y calabaza (100 s, nivel 3), configurables en `js/data.js`. 4 etapas de crecimiento; regar acorta el tiempo y da el doble de cosecha. El tiempo es real, así que crecen aunque cierres el juego. No se puede cosechar antes de tiempo ni dos veces.
- **Mercado:** compra de semillas y venta de cosechas.
- **Misiones (13), logros (10), niveles 1–12**; cada recompensa se da una sola vez.
- **Personaje** con piel, peinado, color, camisa, pantalón, sombrero y accesorios (algunos se desbloquean por nivel) y **3 mascotas** (perro, gato y conejo) que te siguen; el gato se desbloquea con el nivel 3 y el conejo al terminar la lección «Ciclos».
- **Tutorial de Python:** semilla → variables → tipos → operaciones → `if/else` → `for/while` → funciones → pequeños programas. Cada paso explica, deja ejecutar y cambiar el ejemplo, tiene pistas progresivas, repaso de la explicación y escenario visual (variables como cajas con semillas, plantas que se riegan en un ciclo…). Los errores se explican en español sencillo y no se castiga a nadie.
- **Ejecución real de Python** (ver abajo).

### Cómo se comprueban los ejercicios

No se busca una palabra: **el código se ejecuta** y se verifica la salida, los valores y tipos de las variables, y que se use la idea que se enseña (por ejemplo un `for`). Además se hacen pruebas «ocultas»: se cambia el valor de una variable y se vuelve a ejecutar, o se llaman las funciones del jugador con otros datos. Así `print(5)` no pasa un ejercicio de variables. La salida se compara sin distinguir mayúsculas ni tildes.

### Motores de Python

1. **Intérprete propio** (`js/pyinterp.js`): entiende lo que enseña el tutorial. Es instantáneo, funciona sin internet y tiene un límite de pasos (un `while True` se corta en ~50 ms sin congelar la página). Lo comparé con Python real en 65 programas (salida y tipo de error): **0 diferencias**.
2. **Pyodide** (Python completo, `js/python.js`): solo se descarga si el código usa algo que el intérprete propio no entiende (diccionarios, `import`, `class`…). Corre en un Web Worker con límite de 4 s.

## ⚠️ Limitaciones y cosas que NO pude comprobar

Quiero ser claro sobre esto:

- **Backend, cuentas y comunidad: no existen todavía** (los pausaste). Ahora hay *perfiles locales* en el navegador, **sin contraseña** y **no son cuentas reales**. La pantalla «Comunidad» no finge usuarios ni publicaciones: muestra tu perfil público de ejemplo y explica qué falta. «Cerrar sesión» sirve para cambiar de jugador en este dispositivo. Nada de esto debe usarse como seguridad.
- **Pyodide no se pudo probar aquí** (el entorno de pruebas no tiene internet). Probé con Python real el código Python que le entrego a Pyodide, y la rama de «sin internet» (mensaje amable), pero **la descarga y ejecución dentro del Worker están sin verificar**. El tutorial no depende de ello.
- **Sonido:** las pruebas son sin audio; funciona por código pero no lo escuché. Se puede apagar en «Ayuda y controles».
- **Celular:** probé con emulación de pantalla táctil (390×844), no con un teléfono real.
- **Tipografías pixel** (Press Start 2P) requieren internet; sin ella se ve con tipos de letra del sistema.
- Si borras los datos del navegador, se pierde el progreso (por ahora está solo en el dispositivo).
- **JavaScript sin DOM:** el curso enseña el lenguaje (variables, condiciones, ciclos, funciones), pero **no** la manipulación de la página (`document`, eventos, clics). Se dejó fuera porque ejecutar JavaScript con acceso a una página dentro de un iframe puede bloquear todo el juego con un ciclo infinito; harían falta más medidas. El Worker de JavaScript desactiva la red, pero no es un aislamiento perfecto: el código solo corre en el navegador de quien lo escribe.
- **Navegadores:** todas las pruebas automáticas se hicieron en Chromium. La comprobación de HTML/CSS usa un iframe `sandbox="allow-same-origin"` y el JavaScript un Worker creado desde un Blob; **no los probé en Firefox ni Safari**.
- **Las zonas nuevas se probaron en escritorio**; en celular solo probé la granja (el mapa de las zonas es del mismo estilo y tamaño, pero no lo verifiqué en pantalla pequeña).
- **C++ y SQL/MySQL** siguen como «Próximamente»: C++ necesita un servidor con compilador aislado, y MySQL real también un servidor.

## Dónde está cada cosa

```
index.html           la granja a pantalla completa + contenedores de menú/paneles/ventanas
css/
  style.css          base y componentes pixel (botones, marcos, barras)
  game.css           HUD, barra de semillas, controles táctiles, avisos
  interface.css      menú, paneles, ventanas, editor de personaje
  learn.css          lecciones, editor de código, escenario visual
  community.css      pantalla de comunidad
js/
  storage.js         guardado (¡aquí se conectará el backend!) y eventos
  data.js            cultivos, niveles, mascotas, opciones de personaje
  sprites.js         todo el pixel art, dibujado por código
  map.js             sistema de áreas, terreno, objetos y colisiones (+ la granja)
  areas.js           las 3 zonas de aprendizaje (mapas, maestros, animaciones)
  sprites_areas.js   pixel art de las zonas nuevas
  player.js · pets.js        personaje y mascota
  farming.js · inventory.js  siembra/riego/cosecha · inventario y mercado
  missions.js        XP, niveles, misiones y logros
  pyinterp.js        intérprete de Python propio
  python.js          une intérprete + Pyodide, errores en español
  web.js             motor de HTML y CSS (vista previa aislada y comprobación)
  jsrun.js           motor de JavaScript (Worker con límite de tiempo)
  lessons.js         curso de Python (¡aquí se editan las lecciones!)
  lessons_web.js     cursos de HTML, CSS y JavaScript
  programming.js     comprobador de ejercicios y pantalla de lecciones
  avatar.js · panels.js · community.js · ui.js   pantallas y ventanas
  game.js            bucle, cámara, controles, interacción
  main.js            arranque
tests/               pruebas automáticas (ver tests/README.md)
```

### Cómo añadir cosas

- **Un cultivo:** añade una entrada en `FC.CROPS` y `FC.CROP_ORDER` (`js/data.js`) y su dibujo en `cropSprite` (`js/sprites.js`).
- **Una lección o ejercicio:** copia el formato de `js/lessons.js` o `js/lessons_web.js` (`learn`, `exercise`, `quiz`).
- **Una zona nueva:** crea un constructor en `FC.Map.builders.<id>` (ver `js/areas.js`) y registra su curso con `FC.registerCourse`.
- **Una misión:** añade un objeto en `FC.MISSIONS` (`js/missions.js`).

## Siguiente paso recomendado (cuando quieras retomar el backend)

Todo el progreso pasa por `FC.Store` (`js/storage.js`). Para pasar a cuentas reales hay que: (1) un servidor con base de datos y contraseñas con Argon2id o bcrypt y sesiones por cookie `HttpOnly`; (2) cambiar `loadProfile` / `saveNow` / `listProfiles` para que hablen con la API; (3) en `community.js`, conectar perfiles públicos y publicaciones, con validación y permisos en el servidor, límites contra spam y reportes. El resto del juego no cambia.
