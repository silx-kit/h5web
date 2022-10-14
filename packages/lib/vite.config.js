import fs from 'fs';
import path from 'path';
import { URL, fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const dirname = fileURLToPath(new URL('.', import.meta.url));

const [pkg, sharedPkg] = ['.', '../shared'].map((prefix) =>
  JSON.parse(fs.readFileSync(path.resolve(dirname, `${prefix}/package.json`)))
);

export const externals = new Set([
  ...Object.keys(sharedPkg.peerDependencies),
  ...Object.keys(pkg.dependencies).filter(
    (dep) => dep !== 'react-keyed-flatten-children' // Fix https://github.com/silx-kit/h5web/issues/914
  ),
  ...Object.keys(pkg.peerDependencies),
]);

export default defineConfig({
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
