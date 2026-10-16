import { defineBrowserCommand, playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

const browser = process.env.CI
  ? 'chromium' // Firefox doesn't work in CI: https://github.com/microsoft/playwright/issues/11566
  : process.env.VITE_TEST_BROWSER;

// Press mouse button at first point of path, move through other points, then release
// (coordinates are relative to the viewport of the test iframe)
const mouseDrag = defineBrowserCommand(async (ctx, path) => {
  const iframe = ctx.iframe.owner();
  const box = await iframe.boundingBox();
  const scale = box.width / (await iframe.evaluate((elem) => elem.clientWidth));
  const [start, ...rest] = path.map(([x, y]) => [
    box.x + x * scale,
    box.y + y * scale,
  ]);

  await ctx.page.mouse.move(...start);
  await ctx.page.mouse.down();
  for (const point of rest) {
    await ctx.page.mouse.move(...point, { steps: 5 }); // eslint-disable-line no-await-in-loop -- moves must be sequential
  }
  await ctx.page.mouse.up();
});

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'Browser tests',
      include: ['src/**/*.browser.test.ts'],
      setupFiles: 'src/setupTests.ts',
      restoreMocks: true,
      pool: 'threads',
      testTimeout: 10_000,

      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser }],
        viewport: { width: 1920, height: 1080 },
        ui: false,
        commands: { mouseDrag },
      },
    },
  }),
);
