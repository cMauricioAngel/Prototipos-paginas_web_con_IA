'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const HTML_PATH = path.resolve(__dirname, '..', '..', 'Esqueleto_PNL-Zai.html');
const HTML = fs.readFileSync(HTML_PATH, 'utf8');

// Track live jsdom instances so pending timers (e.g. the 4s anchor-collapse
// reset) are torn down between tests instead of leaking open handles.
const openDoms = new Set();

function closeAll() {
  for (const dom of openDoms) {
    dom.window.close();
  }
  openDoms.clear();
}

/**
 * Loads the single-page prototype into a jsdom environment and executes its
 * inline scripts, so tests can exercise the *real* embedded logic (VAK
 * analyzer, quizzes, labs, theme, progress, ...) through the DOM.
 *
 * External CDN scripts (Tailwind, KaTeX, Mermaid, Prism) are never fetched:
 * jsdom does not load external resources here, and the page guards every use
 * of those globals with `if (window.<lib>)`.
 *
 * @param {object} [options]
 * @param {object} [options.storage]        Entries pre-seeded into localStorage before scripts run.
 * @param {boolean} [options.prefersDark]   Value returned by matchMedia('(prefers-color-scheme: dark)').
 * @returns {Promise<{dom: JSDOM, window: Window, document: Document}>}
 */
async function loadPage(options = {}) {
  const { storage = null, prefersDark = false } = options;

  const jsdomErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (err) => {
    jsdomErrors.push(err);
  });

  const dom = new JSDOM(HTML, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://machampimamani.io/',
    virtualConsole,
    beforeParse(window) {
      // Provided by the Tailwind CDN script in a browser; stubbed so the
      // inline `tailwind.config = {...}` block does not throw under jsdom.
      window.tailwind = {};

      // jsdom lacks IntersectionObserver; the scrollspy relies on it.
      window.IntersectionObserver = class {
        constructor(callback) {
          this.callback = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      };

      // jsdom lacks matchMedia; applyTheme() may consult it.
      window.matchMedia = (query) => ({
        matches: query.includes('dark') ? prefersDark : false,
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        },
      });

      if (storage) {
        for (const [key, value] of Object.entries(storage)) {
          window.localStorage.setItem(key, value);
        }
      }
    },
  });

  openDoms.add(dom);

  // Let DOMContentLoaded / load handlers run.
  await new Promise((resolve) => setTimeout(resolve, 0));

  return { dom, window: dom.window, document: dom.window.document, jsdomErrors };
}

/** Dispatches a bubbling event of the given type on an element. */
function fire(element, type) {
  const window = element.ownerDocument.defaultView;
  element.dispatchEvent(new window.Event(type, { bubbles: true }));
}

/** Sets an <input>/<select>/<textarea> value and fires a change + input event. */
function setValue(element, value) {
  element.value = value;
  fire(element, 'input');
  fire(element, 'change');
}

module.exports = { loadPage, fire, setValue, closeAll, HTML_PATH };
