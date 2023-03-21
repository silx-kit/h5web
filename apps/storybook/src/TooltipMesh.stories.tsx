import type { TooltipMeshProps } from '@h5web/lib';
import { Pan, TooltipMesh, VisCanvas, Zoom } from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react';

import VisCanvasStoriesConfig from './VisCanvas.stories';

interface TemplateProps {
  tooltipValue?: string;
  guides?: TooltipMeshProps['guides'];
  panZoom?: boolean;
}

const Template: Story<TemplateProps> = (args) => {
  const { tooltipValue, guides, panZoom } = args;

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      {panZoom && <Pan />}
      {panZoom && <Zoom />}
      {tooltipValue && (
        <TooltipMesh
          guides={guides}
          renderTooltip={(x, y) => (
            <>
              {`x=${formatTooltipVal(x)}, y=${formatTooltipVal(y)}`}
              <div>
                <strong>{tooltipValue}</strong>
              </div>
            </>
          )}
        />
      )}
    </VisCanvas>
  );
};

export const Default = Template.bind({});
Default.args = {
  tooltipValue: 'no value to display',
  panZoom: false,
};

export const Guides = Template.bind({});
Guides.args = {
  tooltipValue: 'guides="both"',
  guides: 'both',
  panZoom: false,
};

export const WithPanZoom = Template.bind({});
WithPanZoom.args = {
  tooltipValue: '<Pan /> and <Zoom /> must come first',
  guides: 'vertical',
  panZoom: true,
};

export default {
  ...VisCanvasStoriesConfig,
  title: 'Building Blocks/TooltipMesh',
  parameters: {
    ...VisCanvasStoriesConfig.parameters,
    controls: {
      include: ['tooltipValue', 'guides', 'panZoom'],
    },
  },
  argTypes: {
    guides: {
      control: { type: 'inline-radio' },
      options: ['horizontal', 'vertical', 'both'],
    },
  },
} as Meta;
