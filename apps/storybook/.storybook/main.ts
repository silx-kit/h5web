import { type StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  framework: '@storybook/react-vite',
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: { docs: false }, // `addon-docs` needs to be configured separately
    },
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm], // https://storybook.js.org/docs/writing-docs/mdx#markdown-tables-arent-rendering-correctly
          },
        },
      },
    },
    '@storybook/addon-links',
  ],
};

export default config;
