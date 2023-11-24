import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';

const dirname = fileURLToPath(new URL('.', import.meta.url));

const [pkg, appPkg, sharedPkg] = ['.', '../app', '../shared'].map((prefix) =>
  JSON.parse(fs.readFileSync(path.resolve(dirname, `${prefix}/package.json`))),
);

export const externals = new Set([
  ...Object.keys(sharedPkg.peerDependencies),
  ...Object.keys(appPkg.dependencies),
  ...Object.keys(appPkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
]);

export default defineConfig({
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
});
