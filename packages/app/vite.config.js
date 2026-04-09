import fs from 'node:fs';
import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { patchCssModules } from 'vite-css-modules';

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
});
