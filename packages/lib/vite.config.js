import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';

const dirname = fileURLToPath(new URL('.', import.meta.url));

const [pkg, sharedPkg] = ['.', '../shared'].map((prefix) =>
  JSON.parse(fs.readFileSync(path.resolve(dirname, `${prefix}/package.json`))),
);

export const externals = new Set([
  ...Object.keys(sharedPkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
]);

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve('src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm.js' : 'js'}`,
    },
    rollupOptions: {
      external: [...externals].map((dep) => new RegExp(`^${dep}($|\\/)`, 'u')), // e.g. externalize `react-icons/fi`
      output: { interop: 'compat' }, // for compatibility with Jest in consumer projects (default changed in Rollup 3/Vite 4: https://rollupjs.org/migration/#changed-defaults)
    },
    sourcemap: true,
  },
});
