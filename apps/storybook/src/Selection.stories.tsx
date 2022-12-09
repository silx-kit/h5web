import type { ModifierKey, Axis, Selection, Rect2 } from '@h5web/lib';
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
import { useThrottledState } from '@react-hookz/web';
import type { Meta, Story } from '@storybook/react';
import { format } from 'd3-format';
import { useState } from 'react';

import FillHeight from './decorators/FillHeight';

const formatCoord = format('.2f');

function getTitle(selection: Rect2 | undefined) {
  if (!selection) {
    return 'No selection';
  }

  const [start, end] = selection;
  return `Selection from (${formatCoord(start.x)}, ${formatCoord(
    start.y
  )}) to (${formatCoord(end.x)}, ${formatCoord(end.y)})`;
}

const SELECTION_COMPONENTS = {
  line: SelectionLine,
  rectangle: SelectionRect,
};

interface TemplateProps {
  selectionType: 'line' | 'rectangle';
  selectionModifierKey?: ModifierKey;
  panModifierKey?: ModifierKey;
  fill?: string;
  stroke?: string;
}

const Template: Story<TemplateProps> = (args) => {
  const { selectionType, selectionModifierKey, panModifierKey, ...svgProps } =
    args;

  const [activeSelection, setActiveSelection] = useThrottledState<
    Selection | undefined
  >(undefined, 50);

  const SelectionComponent = SELECTION_COMPONENTS[selectionType];

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
      title={getTitle(activeSelection?.data)}
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
        {({ data: [dataStart, dataEnd] }) => (
          <SelectionComponent
            startPoint={dataStart}
            endPoint={dataEnd}
            {...svgProps}
          />
        )}
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
  const SelectionComponent = SELECTION_COMPONENTS[selectionType];

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
      title={getTitle(persistedSelection?.data)}
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan modifierKey={panModifierKey} />
      <Zoom />
      <ResetZoomButton />

      <SelectionTool
        modifierKey={selectionModifierKey}
        onSelectionStart={() => setPersistedSelection(undefined)}
        onSelectionEnd={setPersistedSelection}
      >
        {({ data: [dataStart, dataEnd] }) =>
          !persistedSelection && (
            <SelectionComponent startPoint={dataStart} endPoint={dataEnd} />
          )
        }
      </SelectionTool>

      {persistedSelection && (
        <SelectionComponent
          startPoint={persistedSelection.data[0]}
          endPoint={persistedSelection.data[1]}
        />
      )}
    </VisCanvas>
  );
};
Persisted.args = {
  selectionType: 'rectangle',
  selectionModifierKey: undefined,
  panModifierKey: 'Control',
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

  const [activeSelection, setActiveSelection] = useThrottledState<
    Selection | undefined
  >(undefined, 50);

  const SelectionComponent = SELECTION_COMPONENTS[selectionType];

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
      title={getTitle(activeSelection?.data)}
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
        {({ data: [dataStart, dataEnd] }) => (
          <SelectionComponent
            startPoint={dataStart}
            endPoint={dataEnd}
            {...svgProps}
          />
        )}
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
