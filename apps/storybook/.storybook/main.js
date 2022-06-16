module.exports = {
  core: {
    builder: 'webpack5',
    options: {
      lazyCompilation: true,
      fsCache: true,
    },
  },
  features: {
    storyStoreV7: true, // https://storybook.js.org/blog/storybook-on-demand-architecture/
  },
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    'storybook-css-modules-preset',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
};
