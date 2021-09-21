/* eslint-disable no-console */
import '@testing-library/jest-dom'; // https://github.com/testing-library/jest-dom
import { ResizeObserver } from '@juggle/resize-observer';

// Fake `ResizeObserver` support
window.ResizeObserver = ResizeObserver;

// Fake properties to avoid Re-flex warnings
// https://github.com/leefsmp/Re-Flex/issues/27
// https://github.com/jsdom/jsdom/issues/135
['offsetWidth', 'offsetHeight'].forEach((prop) => {
  Object.defineProperty(HTMLElement.prototype, prop, {
    configurable: true,
    value: 500,
  });
});

// Clear localStorage after each test
afterEach(() => {
  window.localStorage.clear();
});

// Fail if error or warning has been logged to the console (notably by React or React Testing Library)
// https://github.com/facebook/jest/issues/6121#issuecomment-768052681
let usedConsole = false;
['log', 'error', 'warn'].forEach((key) => {
  const originalFn = console[key];
  console[key] = (...args) => {
    usedConsole = true;
    originalFn(...args);
  };
});

afterEach(() => {
  if (usedConsole) {
    usedConsole = false;
    throw `To keep the test output readable you should remove all usages of \`console\`.
They mostly refer to fixable errors, warnings and deprecations or forgotten debugging statements.

If your test relies on \`console\` you should mock it:

const errorSpy = mockConsoleMethod('error');
// Your test goes here
errorSpy.mockRestore(); // optional if end of test
`;
  }
});
