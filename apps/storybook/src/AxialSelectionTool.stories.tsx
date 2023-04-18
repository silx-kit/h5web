import type { Selection } from '@h5web/lib';
import {
  AxialSelectionTool,
  Box,
  Pan,
  ResetZoomButton,
  SvgElement,
  SvgRect,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { useThrottledState } from '@react-hookz/web';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';
import { getTitleForSelection } from './utils';

const meta = {
  title: 'Building Blocks/Interactions/AxialSelectionTool',
  component: AxialSelectionTool,
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
} satisfies Meta<typeof AxialSelectionTool>;

export default meta;
type Story = StoryObj<typeof meta>;

const Default = {
  render: function Template(args) {
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
          {...args}
          onSelectionChange={setActiveSelection}
          onSelectionEnd={() => setActiveSelection(undefined)}
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
  },
} satisfies Story;

export const XAxis = {
  ...Default,
  args: {
    axis: 'x',
  },
} satisfies Story;

export const YAxis = {
  ...Default,
  args: {
    axis: 'y',
  },
} satisfies Story;

export const Disabled = {
  ...Default,
  args: {
    disabled: true,
  },
} satisfies Story;

export const WithModifierKey = {
  ...Default,
  args: {
    modifierKey: 'Control',
  },
} satisfies Story;

export const WithValidation = {
  ...Default,
  args: {
    validate: ({ html }) => Box.fromPoints(...html).hasMinSize(200),
  },
} satisfies Story;
