import 'normalize.css';
import '@h5web/shared/styles.css'; // importing via `@h5web/lib/src/styles.css` fails due ot lack of `~` prefix (as it is not supported by Vite)
import '../src/styles.css';

import { type Preview } from '@storybook/react';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    docs: { source: { excludeDecorators: true } },
    options: {
      storySort: {
        order: [
          'Getting started',
          'Utilities',
          'Context',
          'Customization',
          'Visualizations',
          ['LineVis'],
          'Building Blocks',
          [
            'VisCanvas',
            'Interactions',
            [
              'DefaultInteractions',
              'Pan',
              'Zoom',
              'XAxisZoom',
              'YAxisZoom',
              'SelectToZoom',
              'AxialSelectToZoom',
              'SelectionTool',
              'AxialSelectionTool',
            ],
          ],
          'Toolbar',
          ['Toolbar', 'DomainWidget', 'Histogram'],
          'Experimental',
        ],
      },
    },
  },
};

export default preview;
