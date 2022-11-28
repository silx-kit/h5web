import type { Selection, ModifierKey, Axis } from '@h5web/lib';
import { AxialSelectionTool } from '@h5web/lib';
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
  selectionModifierKey?: ModifierKey;
  panModifierKey?: ModifierKey;
  fill?: string;
  stroke?: string;
}

function vectorToStr(vec: Vector2) {
  return `(${format('.2f')(vec.x)}, ${format('.2f')(vec.y)})`;
}

const Template: Story<TemplateProps> = (args) => {
  const { selectionType, selectionModifierKey, panModifierKey, ...svgProps } =
    args;

  const [activeSelection, setActiveSelection] = useState<Selection>();

  const SelectionComponent =
    selectionType === 'line' ? SelectionLine : SelectionRect;

  if (selectionModifierKey === panModifierKey) {
    return (
      <p style={{ margin: '1rem', color: 'darkred' }}>
        Pan and selection modifier keys cannot both be{' '}
        <code>{panModifierKey || 'undefined'}</code>
      </p>
    );
  }

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
      <Pan modifierKey={panModifierKey} />
      <Zoom />
      <ResetZoomButton />

      <SelectionTool
        onSelectionChange={setActiveSelection}
        onSelectionEnd={() => setActiveSelection(undefined)}
        modifierKey={selectionModifierKey}
      >
        {(selection) => <SelectionComponent {...selection} {...svgProps} />}
      </SelectionTool>
    </VisCanvas>
  );
};

export const Rectangle = Template.bind({});
Rectangle.args = {
  selectionType: 'rectangle',
  panModifierKey: 'Control',
};
Rectangle.argTypes = {
  panModifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift'],
  },
};

export const Line = Template.bind({});
Line.args = {
  selectionType: 'line',
  panModifierKey: 'Control',
};
Line.argTypes = {
  panModifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift'],
  },
};

export const WithModifierKey = Template.bind({});
WithModifierKey.args = {
  selectionType: 'rectangle',
  selectionModifierKey: 'Control',
  panModifierKey: undefined,
};
WithModifierKey.argTypes = {
  selectionModifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift', undefined],
  },
  panModifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift', undefined],
  },
};

export const CustomStyles = Template.bind({});
CustomStyles.args = {
  selectionType: 'rectangle',
  fill: 'blue',
  stroke: 'darkslategray',
  panModifierKey: 'Control',
};
CustomStyles.argTypes = {
  fill: { control: { type: 'color' } },
  stroke: { control: { type: 'color' } },
  panModifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift'],
  },
};
CustomStyles.parameters = {
  controls: { exclude: ['selectionType'] },
};

export const Persisted: Story<TemplateProps> = (args) => {
  const { selectionType, selectionModifierKey, panModifierKey } = args;

  const [persistedSelection, setPersistedSelection] = useState<Selection>();

  const SelectionComponent =
    selectionType === 'line' ? SelectionLine : SelectionRect;

  if (selectionModifierKey === panModifierKey) {
    return (
      <p style={{ margin: '1rem', color: 'darkred' }}>
        Pan and selection modifier keys cannot both be{' '}
        <code>{panModifierKey || 'undefined'}</code>
      </p>
    );
  }

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
      <Pan modifierKey={panModifierKey} />
      <Zoom />
      <ResetZoomButton />

      <SelectionTool
        onSelectionStart={() => {
          setPersistedSelection(undefined);
        }}
        onSelectionEnd={setPersistedSelection}
        modifierKey={selectionModifierKey}
      >
        {(selection) =>
          !persistedSelection && <SelectionComponent {...selection} />
        }
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
Persisted.args = {
  selectionType: 'rectangle',
  selectionModifierKey: 'Control',
  panModifierKey: undefined,
};
Persisted.argTypes = {
  selectionModifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift', undefined],
  },
  panModifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift', undefined],
  },
};

export const AxialSelection: Story<TemplateProps & { axis: Axis }> = (args) => {
  const {
    selectionType,
    selectionModifierKey,
    panModifierKey,
    axis,
    ...svgProps
  } = args;

  const [activeSelection, setActiveSelection] = useState<Selection>();

  const SelectionComponent =
    selectionType === 'line' ? SelectionLine : SelectionRect;

  if (selectionModifierKey === panModifierKey) {
    return (
      <p style={{ margin: '1rem', color: 'darkred' }}>
        Pan and selection modifier keys cannot both be{' '}
        <code>{panModifierKey || 'undefined'}</code>
      </p>
    );
  }

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
      <Pan modifierKey={panModifierKey} />
      <Zoom />
      <ResetZoomButton />

      <AxialSelectionTool
        axis={axis}
        onSelectionChange={setActiveSelection}
        onSelectionEnd={() => setActiveSelection(undefined)}
        modifierKey={selectionModifierKey}
      >
        {(selection) => <SelectionComponent {...selection} {...svgProps} />}
      </AxialSelectionTool>
    </VisCanvas>
  );
};

AxialSelection.args = {
  selectionType: 'rectangle',
  panModifierKey: 'Control',
  axis: 'x',
};
AxialSelection.argTypes = {
  axis: {
    control: { type: 'inline-radio' },
    options: ['x', 'y'],
  },
  panModifierKey: {
    control: { type: 'inline-radio' },
    options: ['Alt', 'Control', 'Shift'],
  },
};

export default {
  title: 'Building Blocks/Selection',
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    selectionType: {
      control: { type: 'inline-radio' },
      options: ['line', 'rectangle'],
    },
  },
} as Meta;
