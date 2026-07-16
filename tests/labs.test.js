'use strict';

const { loadPage, fire, setValue } = require('./helpers/loadPage');

describe('módulo 1: laboratorio "El mapa no es el territorio"', () => {
  test('renders the VAK-filtered interpretation for a matching combo', async () => {
    const { document } = await loadPage();
    setValue(document.getElementById('lab-emocion'), 'ansioso');
    setValue(document.getElementById('lab-creencia'), 'amenaza');
    setValue(document.getElementById('lab-vak'), 'visual');

    const out = document.getElementById('lab-output').textContent;
    expect(out).toContain('Ves cómo te mira de reojo');
    expect(out).toContain('he hecho algo mal');
  });

  test('switches the sensory channel with the VAK selector', async () => {
    const { document } = await loadPage();
    setValue(document.getElementById('lab-emocion'), 'ansioso');
    setValue(document.getElementById('lab-creencia'), 'amenaza');
    setValue(document.getElementById('lab-vak'), 'kinestesico');

    const out = document.getElementById('lab-output').textContent;
    expect(out).toContain('nudo en el estómago');
  });

  test('falls back to the ambiguous interpretation for non-matching combos', async () => {
    const { document } = await loadPage();
    setValue(document.getElementById('lab-emocion'), 'relajado');
    setValue(document.getElementById('lab-creencia'), 'amenaza');
    setValue(document.getElementById('lab-vak'), 'visual');

    expect(document.getElementById('lab-output').textContent).toContain('Es ambiguo');
  });
});

describe('módulo 2: analizador de predicados VAK', () => {
  function analyze(document, text) {
    document.getElementById('vak-input').value = text;
    fire(document.getElementById('vak-analyze-btn'), 'click');
  }

  test('detects a visual predominance and percentages sum to 100', async () => {
    const { document } = await loadPage();
    analyze(document, 'veo la imagen claro brillante color enfoque');

    expect(document.getElementById('vak-result').textContent).toContain('Visual');
    expect(document.getElementById('vak-v-pct').textContent).toBe('100%');

    const sum = ['v', 'a', 'k', 'ad']
      .map((k) => parseInt(document.getElementById(`vak-${k}-pct`).textContent, 10))
      .reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  test('detects an auditory predominance', async () => {
    const { document } = await loadPage();
    analyze(document, 'escucho el sonido ruido tono voz');
    expect(document.getElementById('vak-result').textContent).toContain('Auditivo');
    expect(document.getElementById('vak-a-pct').textContent).toBe('100%');
  });

  test('normalizes trailing punctuation before matching', async () => {
    const { document } = await loadPage();
    analyze(document, 'veo.');
    expect(document.getElementById('vak-v-pct').textContent).toBe('100%');
  });

  test('reports when no VAK predicates are found', async () => {
    const { document } = await loadPage();
    analyze(document, 'xyz qwerty zzz');
    expect(document.getElementById('vak-result').textContent).toContain('No se detectaron');
    expect(document.getElementById('vak-v-pct').textContent).toBe('0%');
  });
});

describe('módulo 3: entrenador del Meta-Modelo', () => {
  function patronBtn(document, label) {
    return Array.from(document.querySelectorAll('.meta-patron-btn')).find(
      (b) => b.textContent === label
    );
  }

  test('presents the first phrase with 3 pattern options', async () => {
    const { document } = await loadPage();
    expect(document.getElementById('meta-frase').textContent).toContain('Me haces enfadar');
    expect(document.querySelectorAll('.meta-patron-btn')).toHaveLength(3);
    // The correct pattern is always among the options.
    expect(patronBtn(document, 'Causa-Efecto')).toBeDefined();
  });

  test('choosing the correct pattern reveals the challenge step', async () => {
    const { document } = await loadPage();
    fire(patronBtn(document, 'Causa-Efecto'), 'click');

    expect(document.getElementById('meta-step-2').classList.contains('hidden')).toBe(false);
    const challenges = document.querySelectorAll('.meta-challenge-btn');
    expect(challenges.length).toBeGreaterThan(0);

    // metaData[0].correct === 1
    fire(challenges[1], 'click');
    expect(document.getElementById('meta-feedback').textContent).toContain('✓');
    expect(document.getElementById('meta-next').classList.contains('hidden')).toBe(false);
  });

  test('choosing a wrong pattern shows feedback without revealing the challenge', async () => {
    const { document } = await loadPage();
    const wrong = Array.from(document.querySelectorAll('.meta-patron-btn')).find(
      (b) => b.textContent !== 'Causa-Efecto'
    );
    fire(wrong, 'click');

    expect(document.getElementById('meta-step-2').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('meta-feedback').textContent).toContain('✗');
    expect(document.getElementById('meta-next').classList.contains('hidden')).toBe(false);
  });
});

describe('módulo 4: metaforizador', () => {
  test('weaves the selected elements into the generated metaphor', async () => {
    const { document } = await loadPage();
    setValue(document.getElementById('meta-problema'), 'miedo a fracasar');
    setValue(document.getElementById('meta-dominio'), 'una oruga en capullo');
    setValue(document.getElementById('meta-recurso'), 'transformación y valentía');

    const out = document.getElementById('meta-output').textContent;
    expect(out).toContain('una oruga en capullo');
    expect(out).toContain('transformación y valentía');
    expect(out).toContain('miedo a fracasar');
  });
});

describe('módulo 5: colapso de anclas', () => {
  test('accumulates levels, enables the trigger and reports success', async () => {
    const { document } = await loadPage();
    const btnRecurso = document.getElementById('colapsar-recurso');
    const btnLimite = document.getElementById('colapsar-limite');
    const btnDisparar = document.getElementById('colapsar-disparar');

    expect(btnDisparar.disabled).toBe(true);

    fire(btnRecurso, 'click');
    expect(document.getElementById('nivel-recurso').textContent).toBe('25%');
    // still disabled: límite is 0
    expect(btnDisparar.disabled).toBe(true);

    fire(btnLimite, 'click');
    expect(document.getElementById('nivel-limite').textContent).toBe('25%');
    expect(btnDisparar.disabled).toBe(false);

    fire(btnDisparar, 'click');
    // recurso (25) >= límite (25) -> success
    expect(document.getElementById('colapso-visual').textContent).toContain('Éxito');
  });

  test('caps a level at 100% and reports failure when the limit dominates', async () => {
    const { document } = await loadPage();
    const btnRecurso = document.getElementById('colapsar-recurso');
    const btnLimite = document.getElementById('colapsar-limite');

    // Recurso once (25), límite five times (capped at 100).
    fire(btnRecurso, 'click');
    for (let i = 0; i < 5; i += 1) fire(btnLimite, 'click');
    expect(document.getElementById('nivel-limite').textContent).toBe('100%');

    fire(document.getElementById('colapsar-disparar'), 'click');
    expect(document.getElementById('colapso-visual').textContent).toContain('Fallo');
  });
});

describe('módulo 6: niveles neurológicos', () => {
  function nivelBtn(document, label) {
    return Array.from(document.querySelectorAll('.nivel-btn')).find((b) => b.textContent === label);
  }

  test('marks the correct neurological level', async () => {
    const { document } = await loadPage();
    expect(document.getElementById('nivel-frase').textContent).toContain('No soy capaz');
    fire(nivelBtn(document, 'Identidad'), 'click');
    expect(document.getElementById('nivel-feedback').textContent).toContain('Correcto');
  });

  test('reveals the right level after a wrong answer', async () => {
    const { document } = await loadPage();
    fire(nivelBtn(document, 'Entorno'), 'click');
    const feedback = document.getElementById('nivel-feedback').textContent;
    expect(feedback).toContain('Incorrecto');
    expect(feedback).toContain('Identidad');
  });
});

describe('módulo 7: posiciones perceptuales', () => {
  test('requires all four positions before integrating', async () => {
    const { document } = await loadPage();
    document.getElementById('pos-1').value = 'yo';
    fire(document.getElementById('pos-integrar'), 'click');
    expect(document.getElementById('pos-result').textContent).toContain('completa las 4 posiciones');
  });

  test('produces the meta-mirror synthesis with all inputs', async () => {
    const { document } = await loadPage();
    document.getElementById('pos-1').value = 'mi verdad';
    document.getElementById('pos-2').value = 'su verdad';
    document.getElementById('pos-3').value = 'observador';
    document.getElementById('pos-4').value = 'el sistema';
    fire(document.getElementById('pos-integrar'), 'click');

    const out = document.getElementById('pos-result').textContent;
    expect(out).toContain('Síntesis Integrativa');
    expect(out).toContain('mi verdad');
    expect(out).toContain('el sistema');
  });
});

describe('módulo 8: time line explorer', () => {
  test('renders the "in time" and "through time" perspectives', async () => {
    const { document } = await loadPage();
    fire(document.getElementById('tl-in-time'), 'click');
    expect(document.getElementById('tl-visual').textContent).toContain('dentro');

    fire(document.getElementById('tl-through-time'), 'click');
    expect(document.getElementById('tl-visual').textContent).toContain('toda la línea');
  });
});
