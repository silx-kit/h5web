declare namespace Cypress {
  interface Chainable {
    waitForStableDOM(iteration?: number): void;
    findExplorerNode(name: string): ReturnType<typeof cy.findByRole>;
    selectExplorerNode(name: string): void;
    selectVisTab(name: string): void;
  }
}
