import { DefaultInteractions, FloatingControl, VisCanvas } from '@h5web/lib';
import { useToggle } from '@react-hookz/web';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Toolbar/FloatingControl',
  component: FloatingControl,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
});

export const Default = meta.story({
  render: () => {
    const [isToggled, toggle] = useToggle(false);
    const [withTitle, toggleTitle] = useToggle(false);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, 3], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
        title={withTitle ? 'Plot title' : undefined}
      >
        <DefaultInteractions />
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
});
