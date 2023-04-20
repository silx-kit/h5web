import { FloatingControl, VisCanvas } from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Toolbar/FloatingToolbar',
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: function Template() {
    const [isToggled, toggle] = useToggle(false);
    const [withTitle, toggleTitle] = useToggle(false);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, 3], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
        title={withTitle ? 'Plot title' : undefined}
      >
        <FloatingControl>
          <button
            type="button"
            style={{ fontWeight: isToggled ? 'bold' : undefined }}
            onClick={toggle}
          >
            Toggle me!
          </button>
        </FloatingControl>
        <FloatingControl>
          <button type="button" onClick={toggleTitle}>
            Toggle plot title
          </button>
        </FloatingControl>
      </VisCanvas>
    );
  },
} satisfies Story;
