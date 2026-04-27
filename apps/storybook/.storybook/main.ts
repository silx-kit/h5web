import { defineMain } from '@storybook/react-vite/node';
import remarkGfm from 'remark-gfm';

export default defineMain({
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        // https://storybook.js.org/docs/writing-docs/mdx#markdown-tables-arent-rendering-correctly
        mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } },
      },
    },
    '@storybook/addon-links',
  ],
  core: {
    // Use Vite config from `@h5web/lib` instead of Storybook's default to fix CSS modules
    builder: {
      name: '@storybook/builder-vite',
      options: { viteConfigPath: '../../packages/lib/vite.config.js' },
    },
    disableTelemetry: true,
  },
});
