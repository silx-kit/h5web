/* eslint-disable no-console */
import '@testing-library/jest-dom'; // https://github.com/testing-library/jest-dom

class ResizeObserver {
  public observe() {
    /* do nothing */
  }
  public unobserve() {
    /* do nothing */
  }
  public disconnect() {
    /* do nothing */
  }
}

window.ResizeObserver = ResizeObserver;

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onchange: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

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
(['log', 'error', 'warn'] as const).forEach((key) => {
  const originalFn = console[key];
  console[key] = (...args) => {
    usedConsole = true;
    originalFn(...args);
  };
});

afterEach(() => {
  if (usedConsole) {
    usedConsole = false;
    throw new Error(`To keep the test output readable you should remove all usages of \`console\`.
They mostly refer to fixable errors, warnings and deprecations or forgotten debugging statements.

If your test relies on \`console\` you should mock it:

const errorSpy = mockConsoleMethod('error');
/* YOUR TEST GOES HERE */
errorSpy.mockRestore(); // optional if end of test
`);
  }

  // Restore real timers if applicable (if fake modern timers were used)
  // eslint-disable-next-line prefer-object-has-own
  if (Object.prototype.hasOwnProperty.call(setTimeout, 'clock')) {
    jest.useRealTimers();
  }
});
