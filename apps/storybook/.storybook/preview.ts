import '../src/styles.css';

import { type Preview } from '@storybook/react-vite';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    options: {
      storySort: {
        order: [
          'Getting started',
          'Utilities',
          'Contexts',
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
