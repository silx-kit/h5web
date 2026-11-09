import fs from 'node:fs';
import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineBrowserCommand, playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';
import { patchCssModules } from 'vite-css-modules';
import { configDefaults } from 'vitest/config';

const withChromium = !!process.env.CI || process.argv.includes('--coverage');

// Press mouse button at first point of path, move through other points, then release
// (coordinates are relative to the viewport of the test iframe)
const mouseDrag = defineBrowserCommand(async (ctx, points) => {
  const iframe = ctx.iframe.owner();
  const box = await iframe.boundingBox();
  if (!box) {
    throw new Error('Expected test iframe to be visible');
  }

  const scale = box.width / (await iframe.evaluate((elem) => elem.clientWidth));
  const [start, ...rest] = points.map(([x, y]) => ({
    x: box.x + x * scale,
    y: box.y + y * scale,
  }));

  await ctx.page.mouse.move(start.x, start.y);
  await ctx.page.mouse.down();
  for (const { x, y } of rest) {
    await ctx.page.mouse.move(x, y, { steps: 5 }); // eslint-disable-line no-await-in-loop -- moves must be sequential
  }
  await ctx.page.mouse.up();
});

const [pkg, libPkg, sharedPkg] = ['.', '../lib', '../shared']
  .map((prefix) => path.resolve(import.meta.dirname, `${prefix}/package.json`))
  .map((pkgPath) => JSON.parse(fs.readFileSync(pkgPath)));

export const externals = new Set([
  ...Object.keys(sharedPkg.peerDependencies),
  ...Object.keys(libPkg.dependencies),
  ...Object.keys(libPkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
]);

export default defineConfig({
  plugins: [react(), patchCssModules()],
  build: {
    lib: {
      entry: path.resolve('src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'app', // temp file for `build:css` script
    },
    rolldownOptions: {
      external: [...externals].map(
        (dep) => new RegExp(String.raw`^${dep}($|\/)`, 'u'), // e.g. externalize `react-icons/fi`
      ),
    },
    sourcemap: true,
  },
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
            instances: [{ browser: withChromium ? 'chromium' : 'firefox' }],
            viewport: { width: 1920, height: 1080 },
            commands: { mouseDrag },
            ui: false,
          },
        },
      },
    ],
  },
});
