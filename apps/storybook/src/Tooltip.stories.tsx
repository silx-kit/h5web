import {
  DefaultInteractions,
  FloatingControl,
  Tooltip,
  VisCanvas,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/Tooltip',
  component: Tooltip,
  decorators: [FillHeight],
});

export const Default = meta.story({
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
});

export const CustomStyle = Default.extend({
  args: {
    style: {
      fontSize: '120%',
      padding: '0.5rem 1rem',
      backgroundColor: 'lightblue',
    },
  },
});
