import { addMatchImageSnapshotPlugin } from 'cypress-image-snapshot/plugin';

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  addMatchImageSnapshotPlugin(on, config); // eslint-disable-line @typescript-eslint/no-unsafe-argument
};

export default pluginConfig;
