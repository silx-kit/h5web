import {
  MouseButton,
  Pan,
  PreventDefaultContextMenu,
  ResetZoomButton,
  VisCanvas,
  Zoom,
} from '@h5web/lib';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/Interactions/Pan',
  component: Pan,
  decorators: [FillHeight],
  argTypes: {
    id: { control: false },
    button: {
      control: {
        type: 'inline-check',
        labels: {
          [MouseButton.Left]: 'Left',
          [MouseButton.Middle]: 'Middle',
          [MouseButton.Right]: 'Right',
        },
      },
      options: [MouseButton.Left, MouseButton.Middle, MouseButton.Right],
    },
    modifierKey: {
      control: { type: 'inline-check' },
      options: ['Alt', 'Control', 'Shift'],
    },
    disabled: { control: { type: 'boolean' } },
  },
});

export const Default = meta.story({
  render: (args) => {
    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <Pan {...args} />
        <Zoom />
        <ResetZoomButton />
        <PreventDefaultContextMenu />
      </VisCanvas>
    );
  },
  args: {
    button: [MouseButton.Left],
  },
});

export const ModifierKey = Default.extend({
  args: {
    modifierKey: ['Shift'],
  },
});

export const MultipleModifierKey = Default.extend({
  args: {
    modifierKey: ['Control', 'Shift'],
  },
});

export const MiddleButton = Default.extend({
  args: {
    button: [MouseButton.Middle],
  },
});

export const RightButton = Default.extend({
  args: {
    button: [MouseButton.Right],
  },
});

export const TwoButtons = Default.extend({
  args: {
    button: [MouseButton.Left, MouseButton.Middle],
  },
});

export const Disabled = Default.extend({
  args: {
    disabled: true,
  },
});

export const TwoComponents = meta.story({
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
});
