import fs from 'fs';
import path from 'path';
import { URL, fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const [pkg, sharedPkg] = ['.', '../shared'].map((prefix) =>
  JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `${prefix}/package.json`), {
      encoding: 'utf-8',
    })
  )
);

export const externals = new Set([
  ...Object.keys(sharedPkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
]);

export default defineConfig({
  css: {
    modules: {
      // @ts-ignore
      // root: '.', // https://github.com/vitejs/vite/issues/3092#issuecomment-915952727
    },
  },
  esbuild: {
    jsxInject: `import React from 'react'`, // auto-import React in every file
  },
  build: {
    lib: {
      entry: path.resolve('src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [...externals].map((dep) => new RegExp(`^${dep}($|\\/)`, 'u')), // e.g. externalize `react-icons/fi`
    },
    sourcemap: true,
  },
});
