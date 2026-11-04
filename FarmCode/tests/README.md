# Pruebas de Farm Code

Estas pruebas se usaron durante el desarrollo. No son necesarias para jugar.

- `pyinterp_vs_cpython.py` — ejecuta ~70 programas en el intérprete del juego y en el Python real, y compara la salida y el tipo de error. Necesita `python3` y `node`.
- `lessons_check.py` — abre el juego en un navegador automático (Playwright + Chromium) y comprueba que la solución correcta de cada ejercicio pase y que los intentos incorrectos (incluidos los «con trampa») sean rechazados. Necesita `pip install playwright` y `playwright install chromium`.
- `web_js_courses_check.py` — igual que `lessons_check.py` pero para los cursos de HTML, CSS y JavaScript (39 retos): la solución correcta pasa, los intentos incorrectos se rechazan y el código inicial no resuelve el reto.
- `areas_reachability.py` — comprueba, recorriendo el mapa celda a celda, que en la granja y en las 3 zonas todos los objetos, parcelas y salidas se puedan alcanzar.
