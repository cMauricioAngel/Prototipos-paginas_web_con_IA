'use strict';

const { loadPage, fire } = require('./helpers/loadPage');

const STORAGE_KEY = 'edu_platform_pnl';

describe('core: page integrity', () => {
  test('all module scripts execute without runtime errors', async () => {
    const { jsdomErrors, document } = await loadPage();
    expect(jsdomErrors).toHaveLength(0);
    // Every módulo 1..8 rendered its quiz (proof the IIFEs ran to completion).
    for (let mod = 1; mod <= 8; mod += 1) {
      expect(document.getElementById(`quiz-container-${mod}`).children.length).toBeGreaterThan(0);
    }
  });
});

describe('core: progress persistence', () => {
  test('progress bar reflects previously read sections from localStorage', async () => {
    const state = { theme: 'light', readSections: ['modulo-0', 'modulo-1', 'modulo-2'], quizScores: {} };
    const { document } = await loadPage({ storage: { [STORAGE_KEY]: JSON.stringify(state) } });
    // 3 of 9 sections -> round(33.33) = 33%.
    expect(document.getElementById('progress-text').textContent).toBe('33%');
  });

  test('progress starts at 0% with no saved state', async () => {
    const { document } = await loadPage();
    expect(document.getElementById('progress-text').textContent).toBe('0%');
  });

  test('corrupt saved state does not break the page', async () => {
    const { jsdomErrors, document } = await loadPage({ storage: { [STORAGE_KEY]: '{not valid json' } });
    expect(jsdomErrors).toHaveLength(0);
    expect(document.getElementById('progress-text').textContent).toBe('0%');
  });
});

describe('core: dark mode', () => {
  test('toggle switches theme and persists it', async () => {
    const { document, window } = await loadPage();
    const html = document.documentElement;
    expect(html.classList.contains('dark')).toBe(false);

    fire(document.getElementById('theme-toggle'), 'click');

    expect(html.classList.contains('dark')).toBe(true);
    expect(document.getElementById('icon-moon').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('icon-sun').classList.contains('hidden')).toBe(false);

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(saved.theme).toBe('dark');

    // Toggling again returns to light.
    fire(document.getElementById('theme-toggle'), 'click');
    expect(html.classList.contains('dark')).toBe(false);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).theme).toBe('light');
  });

  test('falls back to prefers-color-scheme when no theme is stored', async () => {
    const state = { readSections: [], quizScores: {} }; // note: no `theme` key
    const { document } = await loadPage({
      storage: { [STORAGE_KEY]: JSON.stringify(state) },
      prefersDark: true,
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('core: mobile sidebar', () => {
  test('menu button opens the sidebar and overlay, overlay closes it', async () => {
    const { document } = await loadPage();
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuBtn = document.getElementById('menu-btn');

    const startsClosed = sidebar.classList.contains('-translate-x-full');
    expect(startsClosed).toBe(true);

    fire(menuBtn, 'click');
    expect(sidebar.classList.contains('-translate-x-full')).toBe(false);
    expect(overlay.classList.contains('hidden')).toBe(false);
    expect(menuBtn.getAttribute('aria-expanded')).toBe('true');

    fire(overlay, 'click');
    expect(sidebar.classList.contains('-translate-x-full')).toBe(true);
    expect(overlay.classList.contains('hidden')).toBe(true);
    expect(menuBtn.getAttribute('aria-expanded')).toBe('false');
  });
});
