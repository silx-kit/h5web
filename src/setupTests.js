// https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// Avoids Re-flex warning
// https://github.com/leefsmp/Re-Flex/issues/27
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 500,
});
