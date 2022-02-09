import {
  LineSelectionMesh,
  PanMesh,
  ZoomMesh,
  RectSelectionMesh,
  VisCanvas,
} from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';
import { format } from 'd3-format';
import { useState } from 'react';
import type { Vector2 } from 'three';

import VisCanvasStoriesConfig from './VisCanvas.stories';

interface TemplateProps {
  selection?: 'line' | 'rectangle';
  yFlip?: boolean;
  disablePan?: boolean;
  disableZoom?: boolean;
  modifierKey?: 'Alt' | 'Control' | 'Shift';
}

function vectorToStr(vec: Vector2) {
  return `(${format('.2f')(vec.x)}, ${format('.2f')(vec.y)})`;
}

const Template: Story<TemplateProps> = (args) => {
  const {
    selection,
    yFlip = false,
    disablePan = true,
    disableZoom = true,
    modifierKey,
  } = args;

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
        <PanMesh disabled={disablePan} />
        <ZoomMesh disabled={disableZoom} />
        {selection === 'line' && (
          <LineSelectionMesh
            onSelection={(start, end) => setSelectedVectors([start, end])}
            modifierKey={modifierKey}
          />
        )}
        {selection === 'rectangle' && (
          <RectSelectionMesh
            onSelection={(start, end) => setSelectedVectors([start, end])}
            modifierKey={modifierKey}
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

export const SelectingWithModifierAndZoom = Template.bind({});
SelectingWithModifierAndZoom.args = {
  selection: 'line',
  disablePan: false,
  disableZoom: false,
  modifierKey: 'Shift',
};

export default {
  ...VisCanvasStoriesConfig,
  title: 'Building Blocks/VisCanvas/Selection',
  parameters: {
    ...VisCanvasStoriesConfig.parameters,
    controls: {
      include: ['yFlip', 'panZoom', 'modifierKey'],
    },
  },
  argTypes: {
    modifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} as Meta;
