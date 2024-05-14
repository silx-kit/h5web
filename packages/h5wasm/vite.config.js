import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
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
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [...externals].map((dep) => new RegExp(`^${dep}($|\\/)`, 'u')), // e.g. externalize `react-icons/fi`
    },
    sourcemap: true,
  },
  test: {
    server: {
      deps: { inline: ['react-suspense-fetch'] },
    },
  },
});
