import { addMatchImageSnapshotPlugin } from '@simonsmith/cypress-image-snapshot/plugin';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support.ts',
    setupNodeEvents(on) {
      addMatchImageSnapshotPlugin(on);

      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          /* On the CI, since there's no physical GPU, Chrome falls back to
           * software WebGL (SwiftShader), which is disabled by default.
           * https://chromestatus.com/feature/5166674414927872 */
          launchOptions.args.push('--enable-unsafe-swiftshader');
        }

        return launchOptions;
      });
    },
  },
  retries: process.env.CYPRESS_TAKE_SNAPSHOTS ? 3 : null,
  screenshotsFolder: 'cypress/debug',
  fixturesFolder: false,
});
