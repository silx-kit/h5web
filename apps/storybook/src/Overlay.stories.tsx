import { Overlay, Pan, VisCanvas, Zoom } from '@h5web/lib';
import { type Meta, type Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

export const Default: Story = () => {
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 3], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100] }}
    >
      <Zoom />
      <Pan />
      <Overlay
        style={{
          background:
            'linear-gradient(135deg, #444cf715 25%, transparent 25%) -20px 0/ 40px 40px, linear-gradient(225deg, #444cf715 25%, transparent 25%) -20px 0/ 40px 40px, linear-gradient(315deg, #444cf715 25%, transparent 25%) 0px 0/ 40px 40px, linear-gradient(45deg, #444cf715 25%, #e5e5f715 25%) 0px 0/ 40px 40px',
        }}
      >
        <p style={{ position: 'absolute', top: 0, left: 10 }}>
          This HTML overlay fills the canvas but lets pointer events through. It
          appears above the axis system's grid and is not affected by
          panning/zooming (unlike <code>Annotation</code>).
        </p>
      </Overlay>
    </VisCanvas>
  );
};

export default {
  title: 'Building Blocks/Overlay',
  component: Default,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
} as Meta;
