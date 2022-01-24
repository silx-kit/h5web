import { LineSelectionMesh, RectSelectionMesh, VisCanvas } from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';
import { format } from 'd3-format';
import { useState } from 'react';
import type { Vector2 } from 'three';

import VisCanvasStoriesConfig from './VisCanvas.stories';

interface TemplateProps {
  selection?: 'line' | 'rectangle';
}

function vectorToStr(vec: Vector2) {
  return `(${format('.2f')(vec.x)}, ${format('.2f')(vec.y)})`;
}

const Template: Story<TemplateProps> = (args) => {
  const { selection } = args;

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

export const SelectingRegions = Template.bind({});
SelectingRegions.args = {
  selection: 'rectangle',
};

export const SelectingLines = Template.bind({});
SelectingLines.args = {
  selection: 'line',
};

export default {
  ...VisCanvasStoriesConfig,
  title: 'Building Blocks/VisCanvas/Selection',
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
