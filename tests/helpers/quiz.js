'use strict';

/**
 * Helpers to drive the per-module multiple-choice quizzes that every "módulo"
 * IIFE renders. They all share the same DOM contract:
 *   - buttons:      .quiz-btn-<mod>       (data-q, data-opt)
 *   - options wrap: #q<mod>-opts-<qIdx>
 *   - feedback:     #q<mod>-feedback-<qIdx>
 *   - score:        #quiz-score-<mod>     ("<score>/<total>")
 */

function optionButtons(document, mod, qIdx) {
  return Array.from(document.querySelectorAll(`#q${mod}-opts-${qIdx} button`));
}

function correctIndex(buttons) {
  return buttons.findIndex((b) => b.classList.contains('border-emerald-500'));
}

function score(document, mod) {
  return document.getElementById(`quiz-score-${mod}`).textContent;
}

function total(document, mod) {
  return document.querySelectorAll(`#quiz-container-${mod} > div`).length;
}

function answer(document, mod, qIdx, optIdx) {
  optionButtons(document, mod, qIdx)[optIdx].dispatchEvent(
    new document.defaultView.Event('click', { bubbles: true })
  );
}

function feedbackText(document, mod, qIdx) {
  return document.getElementById(`q${mod}-feedback-${qIdx}`).textContent;
}

module.exports = {
  optionButtons,
  correctIndex,
  score,
  total,
  answer,
  feedbackText,
};
