import {
  DefaultInteractions,
  FloatingControl,
  Guides,
  VisCanvas,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Guides',
  component: Guides,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Guides>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    const [show, toggle] = useToggle(true);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [-10, 0] }}
        ordinateConfig={{ visDomain: [50, 100] }}
      >
        <DefaultInteractions />
        <Guides show={show} {...args} />

        <FloatingControl>
          <button type="button" onClick={toggle}>
            {show ? 'Hide' : 'Show'} guides
          </button>
        </FloatingControl>
      </VisCanvas>
    );
  },
  args: {
    top: 50,
    left: 60,
  },
} satisfies Story;

export const HorizontalOnly = {
  ...Default,
  args: {
    top: 50,
  },
} satisfies Story;

export const VerticalOnly = {
  ...Default,
  args: {
    left: 60,
  },
} satisfies Story;
