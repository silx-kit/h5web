import { defineBrowserCommand, playwright } from '@vitest/browser-playwright';
import { configDefaults, defineProject } from 'vitest/config';

const browser =
  process.env.VITE_TEST_WITH_CHROMIMUM === 'true' ? 'chromium' : 'firefox';

// Press mouse button at first point of path, move through other points, then release
// (coordinates are relative to the viewport of the test iframe)
const mouseDrag = defineBrowserCommand<[[number, number][]]>(
  async (ctx, path) => {
    const iframe = ctx.iframe.owner();
    const box = await iframe.boundingBox();
    if (!box) {
      throw new Error('Expected test iframe to be visible');
    }

    const scale =
      box.width / (await iframe.evaluate((elem) => elem.clientWidth));
    const [start, ...rest] = path.map(([x, y]) => ({
      x: box.x + x * scale,
      y: box.y + y * scale,
    }));

    await ctx.page.mouse.move(start.x, start.y);
    await ctx.page.mouse.down();
    for (const { x, y } of rest) {
      await ctx.page.mouse.move(x, y, { steps: 5 }); // eslint-disable-line no-await-in-loop -- moves must be sequential
    }
    await ctx.page.mouse.up();
  },
);

export default defineProject({
  test: {
    name: '@h5web/app',
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          exclude: [
            ...configDefaults.exclude,
            'src/**/*.browser.test.{ts,tsx}',
          ],
          restoreMocks: true,
          pool: 'threads',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
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
      },
    ],
  },
});
