/// <reference types="@testing-library/cypress" />
import '@testing-library/cypress/add-commands';

import { addMatchImageSnapshotCommand } from '@simonsmith/cypress-image-snapshot/command';
import { registerCommand as addWaitForStableDomCommand } from 'cypress-wait-for-stable-dom';

addMatchImageSnapshotCommand({
  storeReceivedOnFailure: true, // store failing snapshots to allow for manual update
});

addWaitForStableDomCommand({
  pollInterval: 400, // more than debounce on slicing slider
  timeout: 10000,
});

Cypress.Commands.add('findExplorerNode', (name: string) => {
  return cy.findByRole('treeitem', {
    name: new RegExp(`^${name}(?: \\(NeXus group\\))?$`, 'u'), // account for potential NeXus badge
  });
});

Cypress.Commands.add('selectExplorerNode', (name: string) => {
  cy.findExplorerNode(name).click();
  cy.waitForStableDOM();
});

Cypress.Commands.add('selectVisTab', (name: string) => {
  cy.findByRole('tab', { name }).click();
  cy.waitForStableDOM();
});
