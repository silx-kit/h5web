import {
  FloatingControl,
  MouseButton,
  Pan,
  PreventDefaultContextMenu,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Interactions/PreventDefaultContextMenu',
  component: PreventDefaultContextMenu,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    when: undefined,
  },
  argTypes: {
    when: {
      control: { type: 'inline-check' },
      options: ['when-needed', 'always', 'never'],
    },
  },
} satisfies Meta<typeof PreventDefaultContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WhenNeeded = {
  render: (args) => {
    const [withRightBtn, toggleRightBtn] = useToggle(false);

    return (
      <VisCanvas
        title={`Panning with ${withRightBtn ? 'right' : 'left'} mouse button`}
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <PreventDefaultContextMenu {...args} />

        <Pan button={withRightBtn ? MouseButton.Right : MouseButton.Left} />
        <Zoom />

        <FloatingControl>
          <button type="button" onClick={() => toggleRightBtn()}>
            Pan with {withRightBtn ? 'left' : 'right'} button
          </button>
        </FloatingControl>
      </VisCanvas>
    );
  },
} satisfies Story;

export const Always = {
  ...WhenNeeded,
  args: {
    when: 'always',
  },
} satisfies Story;

export const Never = {
  ...WhenNeeded,
  args: {
    when: 'never',
  },
} satisfies Story;
