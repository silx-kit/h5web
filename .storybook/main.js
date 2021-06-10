module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  typescript: {
    // Temp fix of https://github.com/styleguidist/react-docgen-typescript/issues/356
    // (https://github.com/styleguidist/react-docgen-typescript/issues/356#issuecomment-857887751)
    reactDocgen: 'react-docgen',
  },
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
  ],
};
