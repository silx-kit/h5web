import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';
import { patchCssModules } from 'vite-css-modules';
import { defineProject } from 'vitest/config';

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

export default defineProject({
  plugins: [react(), patchCssModules()],
  build: {
    lib: {
      entry: path.resolve('src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [...externals].map((dep) => new RegExp(`^${dep}($|\\/)`, 'u')), // e.g. externalize `react-icons/fi`
      output: { interop: 'compat' }, // for compatibility with Jest in consumer projects (default changed in Rollup 3/Vite 4: https://rollupjs.org/migration/#changed-defaults)
    },
    sourcemap: true,
  },
  test: {
    setupFiles: ['src/setupTests.ts'],
    environment: 'jsdom',
    restoreMocks: true,
    testTimeout: 15_000,
  },
});
