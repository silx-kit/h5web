import { Pan, ResetZoomButton, VisCanvas, XAxisZoom } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Interactions/XAxisZoom',
  component: XAxisZoom,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    modifierKey: [],
    disabled: false,
  },
  argTypes: {
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} satisfies Meta<typeof XAxisZoom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
    >
      <Pan />
      <XAxisZoom {...args} />
      <ResetZoomButton />
    </VisCanvas>
  ),
} satisfies Story;

export const ModifierKey = {
  ...Default,
  args: {
    modifierKey: ['Alt'],
  },
} satisfies Story;

export const MultipleModifierKeys = {
  ...Default,
  args: {
    modifierKey: ['Control', 'Alt'],
  },
} satisfies Story;

export const Disabled = {
  ...Default,
  args: {
    disabled: true,
  },
} satisfies Story;

export const DisabledInsideEqualAspectCanvas = {
  render: (args) => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
      aspect="equal"
    >
      <Pan />
      <XAxisZoom {...args} />
      <ResetZoomButton />
    </VisCanvas>
  ),
} satisfies Story;
