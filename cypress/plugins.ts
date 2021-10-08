import { addMatchImageSnapshotPlugin } from 'cypress-image-snapshot/plugin';

const config: Cypress.PluginConfig = (on, config) => {
  addMatchImageSnapshotPlugin(on, config); // eslint-disable-line @typescript-eslint/no-unsafe-argument
};

export default config;
