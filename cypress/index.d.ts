declare namespace Cypress {
  interface Chainable {
    waitForStableDOM(iteration?: number): void;
    selectExplorerNode(name: string): void;
    selectVisTab(name: string): void;
  }
}
