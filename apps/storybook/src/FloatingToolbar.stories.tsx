import { FloatingControl, VisCanvas } from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import { type Meta, type Story } from '@storybook/react/types-6-0';

import FillHeight from './decorators/FillHeight';

export const Default: Story = () => {
  const [isToggled, toggle] = useToggle(false);
  const [withTitle, toggleTitle] = useToggle(false);

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 3] }}
      ordinateConfig={{ visDomain: [50, 100] }}
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
};

export default {
  title: 'Toolbar/FloatingToolbar',
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
} as Meta;
