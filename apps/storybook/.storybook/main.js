const path = require('path');

module.exports = {
  features: {
    storyStoreV7: true, // https://storybook.js.org/blog/storybook-on-demand-architecture/
  },
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
  webpackFinal: (config) => {
    // Let webpack process raw TS files imported from local packages
    config.module.rules[2].oneOf[2].include.push(
      ...['../../../packages/lib/src', '../../../packages/shared/src'].map(
        (name) => path.resolve(__dirname, name)
      )
    );

    config.performance.hints = false; // hide assets size warnings
    return config;
  },
};
