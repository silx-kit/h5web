import { addMatchImageSnapshotPlugin } from 'cypress-image-snapshot/plugin';

const config: Cypress.PluginConfig = (on, config) => {
  addMatchImageSnapshotPlugin(on, config);
};

export default config;
