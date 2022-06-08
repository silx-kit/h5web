/* eslint-disable promise/no-nesting */
/* eslint-disable promise/prefer-await-to-then */
import '@testing-library/cypress/add-commands';
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

const INTERVAL = 300; // more than debounce on slicing slider
const TIMEOUT = 2000;
const OBSERVER_CONFIG = {
  subtree: true,
  childList: true,
  attributes: true,
  attributeOldValue: true,
  characterData: true,
  characterDataOldValue: true,
};

// Simplified version of https://github.com/narinluangrath/cypress-wait-for-stable-dom/ due to import issue
function waitForStableDOM(iteration = 0) {
  cy.document().then((document: Document) => {
    let mutation: MutationRecord[];
    const observer = new MutationObserver((m) => (mutation = m));
    observer.observe(document, OBSERVER_CONFIG);

    cy.wait(INTERVAL, { log: false }).then(() => {
      if (!mutation) {
        cy.log(`No changes detected for over ${INTERVAL}ms!`);
        cy.log('Continuing with test...');
        return;
      } else if (iteration * INTERVAL < TIMEOUT) {
        cy.log('Mutation detected... retrying...');
        waitForStableDOM(iteration + 1);
        return;
      }

      throw new Error('Timed out waiting for stable DOM');
    });
  });
}

Cypress.Commands.add('waitForStableDOM', waitForStableDOM);

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

addMatchImageSnapshotCommand();
