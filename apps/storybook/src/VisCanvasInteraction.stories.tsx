import type { PanZoomProps, TooltipMeshProps } from '@h5web/lib';
import { PanZoomMesh, TooltipMesh, VisCanvas } from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react';

import VisCanvasStoriesConfig from './VisCanvas.stories';

interface TemplateProps extends PanZoomProps {
  tooltipValue?: string;
  guides?: TooltipMeshProps['guides'];
}

const Template: Story<TemplateProps> = (args) => {
  const { tooltipValue, guides, ...panZoomProps } = args;

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <PanZoomMesh {...panZoomProps} />
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
PanZoom.args = {
  pan: true,
  zoom: true,
};
PanZoom.argTypes = { guides: { table: { disable: true } } };

export const PanModifier = Template.bind({});
PanModifier.args = {
  pan: true,
  zoom: true,
  panKey: 'Alt',
};
PanModifier.argTypes = { guides: { table: { disable: true } } };

export const PanZoomInXAndY = Template.bind({});
PanZoomInXAndY.args = {
  pan: true,
  zoom: true,
  xZoom: true,
  yZoom: true,
};
PanZoomInXAndY.argTypes = { guides: { table: { disable: true } } };

export const ZoomModifierInX = Template.bind({});
ZoomModifierInX.args = {
  pan: true,
  zoom: true,
  xZoom: true,
  xZoomKey: 'Control',
};
ZoomModifierInX.argTypes = { guides: { table: { disable: true } } };

export const Tooltip = Template.bind({});
Tooltip.args = {
  pan: false,
  zoom: false,
  tooltipValue: 'no value to display',
};

export const TooltipWithGuides = Template.bind({});
TooltipWithGuides.args = {
  pan: false,
  zoom: false,
  tooltipValue: 'guides="both"',
  guides: 'both',
};

export const TooltipWithPanZoom = Template.bind({});
TooltipWithPanZoom.args = {
  pan: true,
  zoom: true,
  tooltipValue: '<PanZoomMesh /> must come first',
  guides: 'vertical',
};

const keyArgType = {
  control: { type: 'inline-radio' },
  options: ['Alt', 'Control', 'Shift'],
};

export default {
  ...VisCanvasStoriesConfig,
  title: 'Building Blocks/VisCanvas/Interaction',
  parameters: {
    ...VisCanvasStoriesConfig.parameters,
    controls: {
      include: [
        'pan',
        'panKey',
        'zoom',
        'xZoomKey',
        'yZoomKey',
        'tooltipValue',
        'guides',
      ],
    },
  },
  argTypes: {
    guides: {
      control: { type: 'inline-radio' },
      options: ['horizontal', 'vertical', 'both'],
    },
    panKey: keyArgType,
    xZoomKey: keyArgType,
    yZoomKey: keyArgType,
  },
} as Meta;
