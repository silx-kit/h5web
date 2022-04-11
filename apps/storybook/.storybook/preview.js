import 'normalize.css';
import '@h5web/shared/src/styles.css'; // importing via `@h5web/lib/src/styles.css` fails due ot lack of `~` prefix (as it is not supported by Vite)
import '../src/styles.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: { source: { excludeDecorators: true } },
  options: {
    storySort: {
      order: [
        'Getting started',
        'Utilities',
        'Contexts',
        'Customization',
        'Visualizations',
        'Building Blocks',
        ['VisCanvas'],
        'Toolbar',
        ['Toolbar'],
      ],
    },
  },
};
