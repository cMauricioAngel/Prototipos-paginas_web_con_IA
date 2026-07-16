'use strict';

const { loadPage } = require('./helpers/loadPage');
const quiz = require('./helpers/quiz');

const MODULES = [1, 2, 3, 4, 5, 6, 7, 8];

describe('module quizzes (shared behavior)', () => {
  test.each(MODULES)('module %i renders one option group per question', async (mod) => {
    const { document } = await loadPage();
    const questions = document.querySelectorAll(`#quiz-container-${mod} > div`);
    expect(questions.length).toBeGreaterThan(0);
    questions.forEach((_, qIdx) => {
      expect(quiz.optionButtons(document, mod, qIdx).length).toBeGreaterThan(0);
    });
    expect(quiz.score(document, mod)).toBe(`0/${questions.length}`);
  });

  test.each(MODULES)('module %i marks exactly one correct option and locks the question', async (mod) => {
    const { document } = await loadPage();
    const buttons = quiz.optionButtons(document, mod, 0);

    quiz.answer(document, mod, 0, 0);

    // Exactly one option is flagged correct (emerald border).
    const emerald = buttons.filter((b) => b.classList.contains('border-emerald-500'));
    expect(emerald).toHaveLength(1);

    // Every option is disabled once answered.
    expect(buttons.every((b) => b.disabled)).toBe(true);

    // Feedback becomes visible.
    expect(document.getElementById(`q${mod}-feedback-0`).classList.contains('hidden')).toBe(false);

    // Re-answering the same question is ignored (score unchanged).
    const before = quiz.score(document, mod);
    quiz.answer(document, mod, 0, 1);
    expect(quiz.score(document, mod)).toBe(before);
  });

  test.each(MODULES)('module %i increments score only for the correct answer', async (mod) => {
    // First pass: answer arbitrarily, then read which option got flagged correct.
    const probe = await loadPage();
    quiz.answer(probe.document, mod, 0, 0);
    const correct = quiz.correctIndex(quiz.optionButtons(probe.document, mod, 0));
    expect(correct).toBeGreaterThanOrEqual(0);

    const wrong = correct === 0 ? 1 : 0;
    const totalQ = quiz.total(probe.document, mod);

    // Fresh page: pick the correct option -> score 1 and ✓ feedback.
    const good = await loadPage();
    quiz.answer(good.document, mod, 0, correct);
    expect(quiz.score(good.document, mod)).toBe(`1/${totalQ}`);
    expect(quiz.feedbackText(good.document, mod, 0)).toContain('✓');

    // Fresh page: pick a wrong option -> score stays 0 and ✗ feedback.
    const bad = await loadPage();
    quiz.answer(bad.document, mod, 0, wrong);
    expect(quiz.score(bad.document, mod)).toBe(`0/${totalQ}`);
    expect(quiz.feedbackText(bad.document, mod, 0)).toContain('✗');
    // The correct option is still highlighted even after a wrong pick.
    expect(quiz.correctIndex(quiz.optionButtons(bad.document, mod, 0))).toBe(correct);
  });
});
