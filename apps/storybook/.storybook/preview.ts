import '../src/styles.css';

import addonDocs from '@storybook/addon-docs';
import addonLinks from '@storybook/addon-links';
import { definePreview } from '@storybook/react-vite';

export default definePreview({
  tags: ['autodocs'],
  addons: [addonDocs(), addonLinks()],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { sort: 'requiredFirst', disableSaveFromUI: true },
    layout: 'fullscreen',
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
});
