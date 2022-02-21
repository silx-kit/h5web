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

import FillHeight from './decorators/FillHeight';

interface TemplateProps {
  selection?: 'line' | 'rectangle';
  disablePan?: boolean;
  disableZoom?: boolean;
  modifierKey?: 'Alt' | 'Control' | 'Shift';
  color?: string;
}

function vectorToStr(vec: Vector2) {
  return `(${format('.2f')(vec.x)}, ${format('.2f')(vec.y)})`;
}

const Template: Story<TemplateProps> = (args) => {
  const {
    selection,
    disablePan = true,
    disableZoom = true,
    modifierKey,
    color,
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
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <PanMesh disabled={disablePan} />
        <ZoomMesh disabled={disableZoom} />
        {selection === 'line' && (
          <LineSelectionMesh
            onSelection={(start, end) => setSelectedVectors([start, end])}
            modifierKey={modifierKey}
            color={color}
          />
        )}
        {selection === 'rectangle' && (
          <RectSelectionMesh
            onSelection={(start, end) => setSelectedVectors([start, end])}
            modifierKey={modifierKey}
            color={color}
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
SelectingWithModifierAndZoom.argTypes = {
  modifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift'],
  },
};

export const ChangeSelectionColors = Template.bind({});
ChangeSelectionColors.args = {
  selection: 'rectangle',
  color: 'blue',
};
ChangeSelectionColors.argTypes = {
  color: {
    control: { type: 'color' },
  },
};

export default {
  title: 'Building Blocks/Selection',
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;
