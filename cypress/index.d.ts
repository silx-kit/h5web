declare namespace Cypress {
  interface Chainable {
    getExplorerNode: (name: string) => ReturnType<typeof cy.getByRole>;
    selectExplorerNode: (name: string) => void;
    selectVisTab: (name: string) => void;
  }
}
