import {
  DefaultInteractions,
  FloatingControl,
  Tooltip,
  VisCanvas,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Tooltip',
  component: Tooltip,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Tooltip>;

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
        <Tooltip show={show} {...args}>
          This is a tooltip
        </Tooltip>

        <FloatingControl>
          <button type="button" onClick={toggle}>
            {show ? 'Hide' : 'Show'} tooltip
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

export const CustomStyle = {
  ...Default,
  args: {
    ...Default.args,
    style: {
      fontSize: '120%',
      padding: '0.5rem 1rem',
      backgroundColor: 'lightblue',
    },
  },
} satisfies Story;
