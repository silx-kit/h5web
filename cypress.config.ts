import { addMatchImageSnapshotPlugin } from '@simonsmith/cypress-image-snapshot/plugin';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support.ts',
    setupNodeEvents(on) {
      addMatchImageSnapshotPlugin(on);
    },
  },
  defaultBrowser: 'firefox',
  retries: process.env.CI ? 2 : null,
  screenshotsFolder: 'cypress/debug',
  fixturesFolder: false,
});
