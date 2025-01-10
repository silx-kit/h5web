declare namespace Cypress {
  interface Chainable {
    findExplorerNode: (name: string) => ReturnType<typeof cy.findByRole>;
    selectExplorerNode: (name: string) => void;
    selectVisTab: (name: string) => void;
  }
}
