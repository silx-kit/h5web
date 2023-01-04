import type { ModifierKey, Rect2, Selection } from '@h5web/lib';
import { DataToWorld } from '@h5web/lib';
import { SvgLine, SvgRect } from '@h5web/lib';
import {
  Pan,
  SelectionTool,
  VisCanvas,
  Zoom,
  ResetZoomButton,
} from '@h5web/lib';
import { useThrottledState } from '@react-hookz/web';
import type { Meta, Story } from '@storybook/react';
import { useState } from 'react';

import FillHeight from './decorators/FillHeight';
import { getTitleForSelection } from './utils';

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
        {({ world }) =>
          selectionType === 'rectangle' ? (
            <SvgRect coords={world} {...svgProps} />
          ) : (
            <SvgLine coords={world} {...svgProps} strokeWidth={2} />
          )
        }
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

export const PersistedDataSelection: Story<TemplateProps> = (args) => {
  const { selectionModifierKey, panModifierKey } = args;
  const [persistedDataSelection, setPersistedDataSelection] = useState<Rect2>();

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
      title={getTitleForSelection(persistedDataSelection)}
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan modifierKey={panModifierKey} />
      <Zoom />
      <ResetZoomButton />

      <SelectionTool
        modifierKey={selectionModifierKey}
        onSelectionStart={() => setPersistedDataSelection(undefined)}
        onSelectionEnd={(selection) =>
          setPersistedDataSelection(selection.data)
        }
      >
        {(selection) => (
          <SvgRect coords={selection.world} fill="teal" fillOpacity="0.3" />
        )}
      </SelectionTool>

      {persistedDataSelection && (
        <DataToWorld coords={persistedDataSelection}>
          {(...worldCoords) => (
            <SvgRect coords={worldCoords} fill="teal" fillOpacity="0.6" />
          )}
        </DataToWorld>
      )}
    </VisCanvas>
  );
};

PersistedDataSelection.argTypes = {
  selectionType: { control: false },
  fill: { control: false },
  stroke: { control: false },
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
