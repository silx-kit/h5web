import '@testing-library/cypress/add-commands';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand();

Cypress.on('uncaught:exception', () => {
  // Silence mysterious error in Firefox 82:
  // "ResizeObserver loop completed with undelivered notifications."
  return false;
});
