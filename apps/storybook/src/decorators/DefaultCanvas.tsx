import { DefaultInteractions, VisCanvas } from '@h5web/lib';
import type { Story } from '@storybook/react';

function DefaultCanvas(MyStory: Story) {
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
    >
      <DefaultInteractions />
      <MyStory />
    </VisCanvas>
  );
}

export default DefaultCanvas;
