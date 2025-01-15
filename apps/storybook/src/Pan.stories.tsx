import { MouseButton, Pan, ResetZoomButton, VisCanvas, Zoom } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Interactions/Pan',
  component: Pan,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    id: undefined,
    button: [MouseButton.Left],
    modifierKey: [],
    disabled: false,
  },
  argTypes: {
    id: { control: false },
    button: {
      control: {
        type: 'inline-check',
        labels: { [MouseButton.Left]: 'Left', [MouseButton.Middle]: 'Middle' },
      },
      options: [MouseButton.Left, MouseButton.Middle],
    },
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} satisfies Meta<typeof Pan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <Pan {...args} />
        <Zoom />
        <ResetZoomButton />
      </VisCanvas>
    );
  },
} satisfies Story;

export const ModifierKey = {
  ...Default,
  args: {
    modifierKey: ['Shift'],
  },
} satisfies Story;

export const MultipleModifierKey = {
  ...Default,
  args: {
    modifierKey: ['Control', 'Shift'],
  },
} satisfies Story;

export const MiddleButton = {
  ...Default,
  args: {
    button: [MouseButton.Middle],
  },
} satisfies Story;

export const TwoButtons = {
  ...Default,
  args: {
    button: [MouseButton.Left, MouseButton.Middle],
  },
} satisfies Story;

export const Disabled = {
  ...Default,
  args: {
    disabled: true,
  },
} satisfies Story;

export const TwoComponents = {
  render: (args) => {
    return (
      <VisCanvas
        title="Pan with middle button, or with <modifierKey> + left button"
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <Pan id="PanMiddle" button={MouseButton.Middle} />
        <Pan
          id="PanLeft"
          button={MouseButton.Left}
          modifierKey={args.modifierKey}
        />
        <Zoom />
        <ResetZoomButton />
      </VisCanvas>
    );
  },
  args: {
    modifierKey: ['Control'],
  },
  argTypes: {
    button: { control: false },
    disabled: { control: false },
  },
} satisfies Story;
