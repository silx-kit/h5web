import 'normalize.css';

if (process.env.STORYBOOK_DIST === 'true') {
  require('@h5web/lib/dist/style.css');
}

require('../src/styles/index.css'); // `require` syntax to maintain correct order

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: { source: { excludeDecorators: true } },
  options: {
    storySort: {
      order: [
        'Getting started',
        'Utilities',
        'Customization',
        'Visualizations',
        'Building Blocks',
        ['VisCanvas'],
      ],
    },
  },
};
