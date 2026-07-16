'use strict';

const { closeAll } = require('./helpers/loadPage');

// Tear down any jsdom windows created during a test so their pending timers
// don't leak into the next one.
afterEach(() => {
  closeAll();
});
