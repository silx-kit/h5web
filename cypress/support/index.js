import '@testing-library/cypress/add-commands';

Cypress.on('uncaught:exception', () => {
  // Silence mysterious error in Firefox 82:
  // "ResizeObserver loop completed with undelivered notifications."
  return false;
});
