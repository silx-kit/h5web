import type {
  ModifierKey,
  Rect,
  Selection,
  SelectionToolProps,
} from '@h5web/lib';
import { Box } from '@h5web/lib';
import { SvgLine } from '@h5web/lib';
import { SvgRect } from '@h5web/lib';
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

interface TemplateProps extends SelectionToolProps {
  selectionModifierKey?: ModifierKey;
  panModifierKey?: ModifierKey;
}

const Template: Story<TemplateProps> = (args) => {
  const { selectionModifierKey, panModifierKey, ...toolProps } = args;

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
        modifierKey={selectionModifierKey}
        onSelectionChange={setActiveSelection}
        onSelectionEnd={() => setActiveSelection(undefined)}
        {...toolProps}
      >
        {({ html: htmlSelection }, _, isValid) => (
          <SvgElement>
            <SvgRect
              coords={htmlSelection}
              fill={isValid ? 'teal' : 'orangered'}
              fillOpacity={0.5}
              stroke={isValid ? 'teal' : 'orangered'}
              strokeWidth={2}
              strokePosition="inside"
            />
          </SvgElement>
        )}
      </SelectionTool>
    </VisCanvas>
  );
};

export const Rectangle = Template.bind({});

export const WithModifierKey = Template.bind({});
WithModifierKey.args = {
  selectionModifierKey: 'Control',
  panModifierKey: undefined,
};

export const WithValidation = Template.bind({});
WithValidation.args = {
  validate: ({ html }) => Box.fromPoints(...html).hasMinSize(100),
};

export const PersistedDataSelection: Story = () => {
  const [persistedDataSelection, setPersistedDataSelection] = useState<Rect>();

  return (
    <VisCanvas
      title={getTitleForSelection(persistedDataSelection)}
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan modifierKey="Control" />
      <Zoom />
      <ResetZoomButton />

      <SelectionTool
        validate={({ html }) => Box.fromPoints(...html).hasMinSize(50)}
        onSelectionStart={() => setPersistedDataSelection(undefined)}
        onValidSelection={({ data }) => setPersistedDataSelection(data)}
      >
        {({ html: htmlSelection }, _, isValid) => (
          <SvgElement>
            <SvgRect
              coords={htmlSelection}
              fill={isValid ? 'teal' : 'orangered'}
              fillOpacity="0.3"
            />
          </SvgElement>
        )}
      </SelectionTool>

      {persistedDataSelection && (
        <DataToHtml points={persistedDataSelection}>
          {(...htmlSelection) => (
            <SvgElement>
              <SvgRect coords={htmlSelection} fill="teal" fillOpacity="0.6" />
            </SvgElement>
          )}
        </DataToHtml>
      )}
    </VisCanvas>
  );
};

PersistedDataSelection.parameters = {
  controls: { disable: true },
};

export const LineWithLengthValidation: Story<TemplateProps> = () => {
  const [isValid, setValid] = useThrottledState<boolean | undefined>(
    undefined,
    50
  );

  return (
    <VisCanvas
      title={
        isValid === undefined
          ? 'No selection'
          : `Line is ${isValid ? 'longer' : 'shorter'} than 100px`
      }
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan modifierKey="Control" />
      <Zoom />
      <ResetZoomButton />

      <SelectionTool
        validate={({ html: [start, end] }) => start.distanceTo(end) >= 100}
        onSelectionChange={(selection, _, isValid) =>
          setValid(selection && isValid)
        }
        onSelectionEnd={() => setValid(undefined)}
      >
        {({ html: htmlSelection }, _, isValid) => (
          <SvgElement>
            <SvgLine
              coords={htmlSelection}
              stroke={isValid ? 'teal' : 'orangered'}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </SvgElement>
        )}
      </SelectionTool>
    </VisCanvas>
  );
};

LineWithLengthValidation.parameters = {
  controls: { disable: true },
};

export default {
  title: 'Building Blocks/SelectionTool',
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    selectionModifierKey: undefined,
    panModifierKey: 'Control',
  },
  argTypes: {
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
