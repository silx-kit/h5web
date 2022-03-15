import type { Selection, ModifierKey } from '@h5web/lib';
import {
  Pan,
  SelectionLine,
  SelectionTool,
  SelectionRect,
  VisCanvas,
  Zoom,
  ResetZoomButton,
} from '@h5web/lib';
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
  fill?: string;
  stroke?: string;
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
    ...svgProps
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
      <ResetZoomButton />
      <SelectionTool
        onSelectionChange={setActiveSelection}
        onSelectionEnd={() => setActiveSelection(undefined)}
        modifierKey={modifierKey}
      >
        {(selection) => <SelectionComponent {...selection} {...svgProps} />}
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

export const ChangeSelectionStyle = Template.bind({});
ChangeSelectionStyle.args = {
  selectionType: 'rectangle',
  fill: 'blue',
  stroke: 'darkslategray',
};
ChangeSelectionStyle.argTypes = {
  fill: {
    control: { type: 'color' },
  },
  stroke: {
    control: { type: 'color' },
  },
};

export const PersistSelection: Story<TemplateProps> = (args) => {
  const {
    selectionType,
    disablePan = true,
    disableZoom = true,
    modifierKey,
    ...svgProps
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
        {(selection) => <SelectionComponent {...selection} {...svgProps} />}
      </SelectionTool>
      {persistedSelection && (
        <SelectionComponent
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
  fill: {
    control: { type: 'color' },
  },
  stroke: {
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
