import { LineSelectionMesh, RectSelectionMesh, VisCanvas } from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';
import { format } from 'd3-format';
import { useState } from 'react';
import type { Vector2 } from 'three';

import VisCanvasStoriesConfig from './VisCanvas.stories';

interface TemplateProps {
  selection?: 'line' | 'rectangle';
  yFlip?: boolean;
}

function vectorToStr(vec: Vector2) {
  return `(${format('.2f')(vec.x)}, ${format('.2f')(vec.y)})`;
}

const Template: Story<TemplateProps> = (args) => {
  const { selection, yFlip } = args;

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
        ordinateConfig={{ visDomain: [50, 100], showGrid: true, flip: yFlip }}
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
  args: {
    yFlip: false,
  },
  parameters: {
    ...VisCanvasStoriesConfig.parameters,
    controls: {
      include: ['yFlip'],
    },
  },
} as Meta;
