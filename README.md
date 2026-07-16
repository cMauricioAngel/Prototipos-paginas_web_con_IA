# Prototipos-paginas_web_con_IA

Prototipo educativo de PNL de una sola página (`Esqueleto_PNL-Zai.html`). Todo el
comportamiento (persistencia de estado, modo oscuro, barra de progreso,
laboratorios interactivos y cuestionarios de cada módulo) vive en JavaScript
embebido dentro del HTML.

## Pruebas

El JavaScript embebido no tenía ninguna cobertura de pruebas. Se añadió una suite
de pruebas unitarias con [Jest](https://jestjs.io/) que carga el HTML real en
[jsdom](https://github.com/jsdom/jsdom), ejecuta sus scripts embebidos y
verifica el comportamiento a través del DOM (sin duplicar la lógica).

```bash
npm install      # instala jest + jsdom
npm test         # ejecuta las pruebas
npm run test:coverage
```

### Qué se cubre

- **Core** (`tests/core.test.js`): carga sin errores, persistencia de progreso en
  `localStorage`, modo oscuro (toggle + `prefers-color-scheme`) y menú lateral móvil.
- **Cuestionarios** (`tests/quizzes.test.js`): comportamiento compartido de los 8
  cuestionarios (render, marcado de la respuesta correcta, bloqueo tras responder,
  puntuación).
- **Laboratorios y entrenadores** (`tests/labs.test.js`): laboratorio del "mapa",
  analizador de predicados VAK, entrenador del Meta-Modelo, metaforizador, colapso
  de anclas, niveles neurológicos, posiciones perceptuales y time line explorer.

El ayudante `tests/helpers/loadPage.js` monta la página en jsdom (con stubs para
`IntersectionObserver`, `matchMedia` y el objeto `tailwind` que normalmente aporta
el CDN) y expone utilidades para disparar eventos.
