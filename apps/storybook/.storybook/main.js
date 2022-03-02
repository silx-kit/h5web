const path = require('path');

module.exports = {
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
