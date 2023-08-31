import {
  DataToHtml,
  DefaultInteractions,
  ResetZoomButton,
  SvgElement,
  useDrag,
  VisCanvas,
} from '@h5web/lib';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Vector3 } from 'three';

import FillHeight from './decorators/FillHeight';
import styles from './useDrag.stories.module.css';

const meta = {
  title: 'Experimental/useDrag',
  decorators: [
    (Story) => (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
        ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
      >
        <DefaultInteractions />
        <ResetZoomButton />
        <Story />
      </VisCanvas>
    ),
    FillHeight,
  ],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => {
    const [center, setCenter] = useState(() => new Vector3(2, 6));

    const { delta, isDragging, startDrag } = useDrag({
      onDragEnd: (d) => setCenter((c) => c.clone().add(d)),
    });

    return (
      <DataToHtml points={[center.clone().add(delta)]}>
        {(htmlCenter) => (
          <SvgElement>
            <circle
              className={styles.dragCircle}
              cx={htmlCenter.x}
              cy={htmlCenter.y}
              r={40}
              data-dragging={isDragging || undefined}
              onPointerDown={(evt) => {
                evt.stopPropagation();
                startDrag(evt.nativeEvent);
              }}
            />
          </SvgElement>
        )}
      </DataToHtml>
    );
  },
} satisfies Story;
