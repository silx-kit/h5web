// https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Avoids Re-flex warning
// https://github.com/leefsmp/Re-Flex/issues/27
['offsetWidth', 'offsetHeight'].forEach(prop => {
  Object.defineProperty(HTMLElement.prototype, prop, {
    configurable: true,
    value: 500,
  });
});
