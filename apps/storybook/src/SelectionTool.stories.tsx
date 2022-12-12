import type { ModifierKey, Selection } from '@h5web/lib';
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
import { useState } from 'react';

import FillHeight from './decorators/FillHeight';
import { getTitleForSelection } from './utils';

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
      title={getTitleForSelection(activeSelection?.data)}
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

export const Line = Template.bind({});
Line.args = { selectionType: 'line' };

export const WithModifierKey = Template.bind({});
WithModifierKey.args = {
  selectionModifierKey: 'Control',
  panModifierKey: undefined,
};

export const CustomStyles = Template.bind({});
CustomStyles.args = {
  fill: 'darkturquoise',
  stroke: 'blue',
};
CustomStyles.argTypes = {
  fill: { control: { type: 'color' } },
  stroke: { control: { type: 'color' } },
};

export const Persisted: Story<
  Pick<TemplateProps, 'selectionModifierKey' | 'panModifierKey'>
> = (args) => {
  const { selectionModifierKey, panModifierKey } = args;
  const [persistedSelection, setPersistedSelection] = useState<Selection>();

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
      title={getTitleForSelection(persistedSelection?.data)}
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
        {({ data: [dataStart, dataEnd] }) => (
          <SelectionRect startPoint={dataStart} endPoint={dataEnd} />
        )}
      </SelectionTool>

      {persistedSelection && (
        <SelectionRect
          startPoint={persistedSelection.data[0]}
          endPoint={persistedSelection.data[1]}
        />
      )}
    </VisCanvas>
  );
};

export default {
  title: 'Building Blocks/SelectionTool',
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    selectionType: 'rectangle',
    selectionModifierKey: undefined,
    panModifierKey: 'Control',
  },
  argTypes: {
    selectionType: {
      control: { type: 'inline-radio' },
      options: ['line', 'rectangle'],
    },
    selectionModifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift', undefined],
    },
    panModifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift', undefined],
    },
  },
} as Meta;
