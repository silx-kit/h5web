import fs from 'node:fs';
import path from 'node:path';

import react from '@vitejs/plugin-react-swc';
import { patchCssModules } from 'vite-css-modules';
import { defineProject } from 'vitest/config';

const [pkg, sharedPkg] = ['.', '../shared']
  .map((prefix) => path.resolve(import.meta.dirname, `${prefix}/package.json`))
  .map((pkgPath) => JSON.parse(fs.readFileSync(pkgPath)));

export const externals = new Set([
  ...Object.keys(sharedPkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
]);

export default defineProject({
  plugins: [react(), patchCssModules()],
  build: {
    lib: {
      entry: path.resolve('src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'lib',
    },
    rollupOptions: {
      external: [...externals].map(
        (dep) => new RegExp(String.raw`^${dep}($|\/)`, 'u'), // e.g. externalize `react-icons/fi`
      ),
      output: { interop: 'compat' }, // for compatibility with Jest in consumer projects (default changed in Rollup 3/Vite 4: https://rollupjs.org/migration/#changed-defaults)
    },
    sourcemap: true,
  },
});
