import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

const pkg = JSON.parse(
  fs.readFileSync('./package.json', { encoding: 'utf-8' })
);

export default defineConfig({
  css: {
    modules: {
      // @ts-ignore
      root: '.', // https://github.com/vitejs/vite/issues/3092#issuecomment-915952727
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
      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies),
      ].map((dep) => new RegExp(`^${dep}($|\\/)`, 'u')), // e.g. externalize `react-icons/fi`
    },
    sourcemap: true,
  },
  plugins: [reactRefresh()],
});
