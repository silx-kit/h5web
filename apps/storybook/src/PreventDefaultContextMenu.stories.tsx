import {
  FloatingControl,
  MouseButton,
  Pan,
  PreventDefaultContextMenu,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/Interactions/PreventDefaultContextMenu',
  component: PreventDefaultContextMenu,
  decorators: [FillHeight],
  argTypes: {
    when: {
      control: { type: 'inline-check' },
      options: ['when-needed', 'always', 'never', undefined],
    },
  },
});

export const WhenNeeded = meta.story({
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
});

export const Always = WhenNeeded.extend({
  args: {
    when: 'always',
  },
});

export const Never = WhenNeeded.extend({
  args: {
    when: 'never',
  },
});
