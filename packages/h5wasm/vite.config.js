import fs from 'node:fs';
import path from 'node:path';

import react from '@vitejs/plugin-react-swc';
import { defineProject } from 'vitest/config';

const [pkg, appPkg, sharedPkg] = ['.', '../app', '../shared']
  .map((prefix) => path.resolve(import.meta.dirname, `${prefix}/package.json`))
  .map((pkgPath) => JSON.parse(fs.readFileSync(pkgPath)));

export const externals = new Set([
  ...Object.keys(sharedPkg.peerDependencies),
  ...Object.keys(appPkg.dependencies),
  ...Object.keys(appPkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
]);

export default defineProject({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve('src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [...externals].map(
        (dep) => new RegExp(String.raw`^${dep}($|\/)`, 'u'), // e.g. externalize `react-icons/fi`
      ),
    },
    sourcemap: true,
  },
});
