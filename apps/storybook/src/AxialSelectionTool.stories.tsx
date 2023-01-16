import type { AxialSelectionToolProps, Selection } from '@h5web/lib';
import { Box } from '@h5web/lib';
import { SvgRect } from '@h5web/lib';
import { SvgElement } from '@h5web/lib';
import {
  AxialSelectionTool,
  Pan,
  ResetZoomButton,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { useThrottledState } from '@react-hookz/web';
import type { Meta, Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';
import { getTitleForSelection } from './utils';

const Template: Story<AxialSelectionToolProps> = (args) => {
  const { modifierKey } = args;

  const [activeSelection, setActiveSelection] = useThrottledState<
    Selection | undefined
  >(undefined, 50);

  return (
    <VisCanvas
      title={getTitleForSelection(activeSelection?.data)}
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Pan modifierKey={modifierKey === 'Control' ? undefined : 'Control'} />
      <Zoom />
      <ResetZoomButton />

      <AxialSelectionTool
        onSelectionChange={setActiveSelection}
        onSelectionEnd={() => setActiveSelection(undefined)}
        {...args}
      >
        {({ html: htmlSelection }, _, isValid) => (
          <SvgElement>
            <SvgRect
              coords={htmlSelection}
              fill={isValid ? 'teal' : 'orangered'}
              fillOpacity={0.5}
            />
          </SvgElement>
        )}
      </AxialSelectionTool>
    </VisCanvas>
  );
};

export const XAxis = Template.bind({});
XAxis.args = { axis: 'x' };

export const YAxis = Template.bind({});
YAxis.args = { axis: 'y' };

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export const WithModifierKey = Template.bind({});
WithModifierKey.args = { modifierKey: 'Control' };

export const WithValidation = Template.bind({});
WithValidation.args = {
  validate: ({ html }) => Box.fromPoints(...html).hasMinSize(200),
};

export default {
  title: 'Building Blocks/AxialSelectionTool',
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    axis: 'x',
    disabled: false,
    modifierKey: undefined,
  },
  argTypes: {
    axis: {
      control: { type: 'inline-radio' },
      options: ['x', 'y'],
    },
    modifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift', undefined],
    },
  },
} as Meta;
