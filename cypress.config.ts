import { defineConfig } from 'cypress';
import { addMatchImageSnapshotPlugin } from 'cypress-image-snapshot/plugin';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support.ts',
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on, config);
    },
  },
  retries: process.env.TAKE_SNAPSHOTS ? 3 : null,
  screenshotsFolder: 'cypress/debug',
  fixturesFolder: false,
  video: false,
});
