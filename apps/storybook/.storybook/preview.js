import 'normalize.css';
import '@h5web/lib/src/styles.css';
// import '@h5web/lib/dist/style.css';
import '../src/styles/index.css';

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
