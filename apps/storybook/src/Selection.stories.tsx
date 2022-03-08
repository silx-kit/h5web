import {
  Pan,
  SelectionLine,
  SelectionTool,
  SelectionRect,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import type { ModifierKey, Selection } from '@h5web/lib/src/vis/models';
import type { Meta, Story } from '@storybook/react';
import { format } from 'd3-format';
import { useState } from 'react';
import type { Vector2 } from 'three';

import FillHeight from './decorators/FillHeight';

interface TemplateProps {
  selectionType: 'line' | 'rectangle';
  disablePan?: boolean;
  disableZoom?: boolean;
  modifierKey?: ModifierKey;
  color?: string;
}

function vectorToStr(vec: Vector2) {
  return `(${format('.2f')(vec.x)}, ${format('.2f')(vec.y)})`;
}

const Template: Story<TemplateProps> = (args) => {
  const {
    selectionType,
    disablePan = true,
    disableZoom = true,
    modifierKey,
    color,
  } = args;

  const [activeSelection, setActiveSelection] = useState<Selection>();

  const SelectionComponent =
    selectionType === 'line' ? SelectionLine : SelectionRect;

  return (
    <VisCanvas
      title={
        activeSelection
          ? `Selection from ${vectorToStr(
              activeSelection.startPoint
            )} to ${vectorToStr(activeSelection.endPoint)}`
          : 'No selection'
      }
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan disabled={disablePan} />
      <Zoom disabled={disableZoom} />
      <SelectionTool
        onSelectionChange={setActiveSelection}
        onSelectionEnd={() => setActiveSelection(undefined)}
        modifierKey={modifierKey}
      >
        {(selection) => <SelectionComponent color={color} {...selection} />}
      </SelectionTool>
    </VisCanvas>
  );
};

export const SelectingRegions = Template.bind({});
SelectingRegions.args = {
  selectionType: 'rectangle',
};

export const SelectingLines = Template.bind({});
SelectingLines.args = {
  selectionType: 'line',
};

export const SelectingWithModifierAndZoom = Template.bind({});
SelectingWithModifierAndZoom.args = {
  selectionType: 'line',
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
  selectionType: 'rectangle',
  color: 'blue',
};
ChangeSelectionColors.argTypes = {
  color: {
    control: { type: 'color' },
  },
};

export const PersistSelection: Story<TemplateProps> = (args) => {
  const {
    selectionType,
    disablePan = true,
    disableZoom = true,
    modifierKey,
    color,
  } = args;

  const [persistedSelection, setPersistedSelection] = useState<Selection>();

  const SelectionComponent =
    selectionType === 'line' ? SelectionLine : SelectionRect;

  return (
    <VisCanvas
      title={
        persistedSelection
          ? `Selection from ${vectorToStr(
              persistedSelection.startPoint
            )} to ${vectorToStr(persistedSelection.endPoint)}`
          : 'No selection'
      }
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan disabled={disablePan} />
      <Zoom disabled={disableZoom} />
      <SelectionTool
        onSelectionStart={() => {
          setPersistedSelection(undefined);
        }}
        onSelectionEnd={setPersistedSelection}
        modifierKey={modifierKey}
      >
        {(selection) => <SelectionComponent color={color} {...selection} />}
      </SelectionTool>
      {persistedSelection && (
        <SelectionComponent
          color={color}
          startPoint={persistedSelection.startPoint}
          endPoint={persistedSelection.endPoint}
        />
      )}
    </VisCanvas>
  );
};
PersistSelection.args = {
  selectionType: 'rectangle',
};
PersistSelection.argTypes = {
  modifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift'],
  },
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
  argTypes: {
    selectionType: {
      control: { type: 'inline-radio' },
      options: ['line', 'rectangle'],
    },
  },
} as Meta;
