import '@testing-library/jest-dom'; // https://github.com/testing-library/jest-dom

// Fake properties to avoid Re-flex warnings
// https://github.com/leefsmp/Re-Flex/issues/27
// https://github.com/jsdom/jsdom/issues/135
['offsetWidth', 'offsetHeight'].forEach((prop) => {
  Object.defineProperty(HTMLElement.prototype, prop, {
    configurable: true,
    value: 500,
  });
});

// Fail if error or warning has been logged to the console (notably by React or React Testing Library)
// Inpsired by https://github.com/facebook/jest/issues/6121#issuecomment-493529970
let consoleHasErrorOrWarning = false;
const { error, warn } = console;

global.console.error = (...args) => {
  consoleHasErrorOrWarning = true;
  error(...args);
};
global.console.warn = (...args) => {
  consoleHasErrorOrWarning = true;
  warn(...args);
};

afterEach(() => {
  if (consoleHasErrorOrWarning) {
    consoleHasErrorOrWarning = false;
    throw new Error('Console has error or warning');
  }
});
