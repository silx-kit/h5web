import type { Meta, Story } from '@storybook/react';
import VisCanvasStoriesConfig from './VisCanvas.stories';
import { PanZoomMesh, TooltipMesh, VisCanvas } from '../packages/lib';
import { format } from 'd3-format';
import type { Coords } from '../h5web/vis-packs/core/models';
import type { TooltipMeshProps } from '../h5web/vis-packs/core/shared/TooltipMesh';

const formatCoord = format('.3');
const formatIndex = ([x, y]: Coords) =>
  `x=${formatCoord(x)} y=${formatCoord(y)}`;

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
          formatIndex={formatIndex}
          formatValue={() => tooltipValue}
          guides={guides}
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
