import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { externals as libExternals } from '@h5web/lib/vite.config.js';

const __dirname = new URL('.', import.meta.url).pathname;

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), {
    encoding: 'utf-8',
  })
);

const externals = new Set([
  ...libExternals,
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
    jsxInject: `import React from 'react'`,
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
  plugins: [reactRefresh()],
});
