import type { Meta, Story } from '@storybook/react';
import VisCanvasStoriesConfig from './VisCanvas.stories';
import { PanZoomMesh, TooltipMesh, VisCanvas } from '../packages/lib';
import type { TooltipMeshProps } from '../h5web/vis-packs/core/shared/TooltipMesh';
import { formatTooltipVal } from '../h5web/utils';

interface TemplateProps {
  panZoom?: boolean;
  tooltipValue?: string;
  guides?: TooltipMeshProps['guides'];
}

const Template: Story<TemplateProps> = (args) => {
  const { panZoom = false, tooltipValue, guides } = args;

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      {panZoom && <PanZoomMesh />}
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

export const PanZoom = Template.bind({});
PanZoom.args = { panZoom: true };
PanZoom.argTypes = { guides: { table: { disable: true } } };

export const Tooltip = Template.bind({});
Tooltip.args = {
  tooltipValue: 'no value to display',
};

export const TooltipWithGuides = Template.bind({});
TooltipWithGuides.args = {
  tooltipValue: 'guides="both"',
  guides: 'both',
};

export const TooltipWithPanZoom = Template.bind({});
TooltipWithPanZoom.args = {
  panZoom: true,
  tooltipValue: '<PanZoomMesh /> must come first',
  guides: 'vertical',
};

export default {
  ...VisCanvasStoriesConfig,
  title: 'Building Blocks/VisCanvas/Interaction',
  parameters: {
    ...VisCanvasStoriesConfig.parameters,
    controls: { include: ['panZoom', 'tooltipValue', 'guides'] },
  },
  argTypes: {
    guides: {
      control: {
        type: 'inline-radio',
        options: ['horizontal', 'vertical', 'both'],
      },
    },
  },
} as Meta;
