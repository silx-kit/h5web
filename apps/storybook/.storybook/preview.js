import 'normalize.css';
import '../src/styles.css';
import '@h5web/shared/src/utils.css'; // fix missing shared styles in development

if (process.env.STORYBOOK_DIST === 'true') {
  require('@h5web/lib/dist/style.css');
}

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
