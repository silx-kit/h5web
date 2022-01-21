import {
  PanZoomMesh,
  TooltipMesh,
  LineSelectionMesh,
  RectSelectionMesh,
  VisCanvas,
} from '@h5web/lib';
import type { TooltipMeshProps } from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react';
import { format } from 'd3-format';
import { useState } from 'react';
import type { Vector2 } from 'three';

import VisCanvasStoriesConfig from './VisCanvas.stories';

interface TemplateProps {
  panZoom?: boolean;
  tooltipValue?: string;
  guides?: TooltipMeshProps['guides'];
  selection?: 'line' | 'rectangle';
}

function vectorToStr(vec: Vector2) {
  return `(${format('.2f')(vec.x)}, ${format('.2f')(vec.y)})`;
}

const Template: Story<TemplateProps> = (args) => {
  const { panZoom = false, tooltipValue, guides, selection } = args;

  const [selectedVectors, setSelectedVectors] = useState<[Vector2, Vector2]>();

  return (
    <>
      {selection && (
        <p style={{ textAlign: 'center' }}>
          {selectedVectors
            ? `Selection from ${vectorToStr(
                selectedVectors[0]
              )} to ${vectorToStr(selectedVectors[1])}`
            : 'No selection'}
        </p>
      )}
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
        {selection === 'line' && (
          <LineSelectionMesh
            onSelection={(start, end) => setSelectedVectors([start, end])}
          />
        )}
        {selection === 'rectangle' && (
          <RectSelectionMesh
            onSelection={(start, end) => setSelectedVectors([start, end])}
          />
        )}
      </VisCanvas>
    </>
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

export const SelectingRegions = Template.bind({});
SelectingRegions.args = {
  panZoom: false,
  selection: 'rectangle',
};

export const SelectingLines = Template.bind({});
SelectingLines.args = {
  panZoom: false,
  selection: 'line',
};

export default {
  ...VisCanvasStoriesConfig,
  title: 'Building Blocks/VisCanvas/Interaction',
  parameters: {
    ...VisCanvasStoriesConfig.parameters,
    controls: {
      include: ['panZoom', 'tooltipValue', 'guides'],
    },
  },
  argTypes: {
    guides: {
      control: { type: 'inline-radio' },
      options: ['horizontal', 'vertical', 'both'],
    },
  },
} as Meta;
