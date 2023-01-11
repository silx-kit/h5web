import type { ModifierKey, Rect, Selection } from '@h5web/lib';
import { getSvgLineCoords } from '@h5web/lib';
import { getSvgRectCoords } from '@h5web/lib';
import { SvgElement } from '@h5web/lib';
import { DataToHtml } from '@h5web/lib';
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
}

const Template: Story<TemplateProps> = (args) => {
  const { selectionType, selectionModifierKey, panModifierKey } = args;

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
        {({ html: htmlSelection }) => (
          <SvgElement>
            {selectionType === 'rectangle' ? (
              <rect
                {...getSvgRectCoords(htmlSelection)}
                stroke="teal"
                strokeWidth={2}
                fill="teal"
                fillOpacity={0.5}
              />
            ) : (
              <line
                {...getSvgLineCoords(htmlSelection)}
                stroke="teal"
                strokeWidth={3}
                strokeDasharray="10"
                strokeLinecap="round"
              />
            )}
          </SvgElement>
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

export const PersistedDataSelection: Story<TemplateProps> = (args) => {
  const { selectionModifierKey, panModifierKey } = args;
  const [persistedDataSelection, setPersistedDataSelection] = useState<Rect>();

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
        {({ html: htmlSelection }) => (
          <SvgElement>
            <rect
              {...getSvgRectCoords(htmlSelection)}
              fill="teal"
              fillOpacity="0.3"
            />
          </SvgElement>
        )}
      </SelectionTool>

      {persistedDataSelection && (
        <DataToHtml points={persistedDataSelection}>
          {(...htmlSelection) => (
            <SvgElement>
              <rect
                {...getSvgRectCoords(htmlSelection)}
                fill="teal"
                fillOpacity="0.6"
              />
            </SvgElement>
          )}
        </DataToHtml>
      )}
    </VisCanvas>
  );
};

PersistedDataSelection.argTypes = {
  selectionType: { control: false },
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
