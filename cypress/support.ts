import '@testing-library/cypress/add-commands';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';
import { registerCommand as addWaitForStableDomCommand } from 'cypress-wait-for-stable-dom';

addMatchImageSnapshotCommand();

addWaitForStableDomCommand({
  pollInterval: 300, // more than debounce on slicing slider
  timeout: 2000,
});

Cypress.Commands.add('selectExplorerNode', (name: string) => {
  cy.findByRole('treeitem', {
    name: new RegExp(`^${name}(?: \\(NeXus group\\))?$`, 'u'), // account for potential NeXus badge
  }).click();
  cy.waitForStableDOM();
});

Cypress.Commands.add('selectVisTab', (name: string) => {
  cy.findByRole('tab', { name }).click();
  cy.waitForStableDOM();
});
