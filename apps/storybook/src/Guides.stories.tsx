import {
  DefaultInteractions,
  FloatingControl,
  Guides,
  VisCanvas,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/Guides',
  component: Guides,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
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
});

export const HorizontalOnly = Default.extend({
  args: {
    top: 50,
    left: undefined,
  },
});

export const VerticalOnly = Default.extend({
  args: {
    top: undefined,
    left: 60,
  },
});
