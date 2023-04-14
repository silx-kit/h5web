import {
  DataToHtml,
  Pan,
  ResetZoomButton,
  SvgCircle,
  SvgElement,
  SvgLine,
  SvgRect,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { type Meta, type Story } from '@storybook/react';
import { Vector3 } from 'three';

import FillHeight from './decorators/FillHeight';
import styles from './SvgElement.stories.module.css';

export const Default: Story = () => {
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 10], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 10], showGrid: true }}
    >
      <Pan />
      <Zoom />
      <ResetZoomButton />

      <DataToHtml
        points={[
          new Vector3(2, 8),
          new Vector3(4, 6),
          new Vector3(3, 2),
          new Vector3(6, 4),
          new Vector3(6, 6),
          new Vector3(7, 7),
        ]}
      >
        {(pt1, pt2, pt3, pt4, pt5, pt6) => (
          <SvgElement>
            <SvgRect className={styles.rect} coords={[pt1, pt2]} />
            <SvgLine
              coords={[pt3, pt4]}
              stroke="darkblue"
              strokeWidth={5}
              strokeDasharray={15}
              strokeLinecap="round"
            />
            <SvgRect
              coords={[pt5, pt6]}
              fill="none"
              stroke="teal"
              strokeWidth={10}
              strokePosition="outside"
            />
            <SvgCircle coords={[pt5, pt6]} fill="none" stroke="lightseagreen" />
          </SvgElement>
        )}
      </DataToHtml>
    </VisCanvas>
  );
};

Default.parameters = {
  controls: { disable: true },
};

export default {
  title: 'Building Blocks/SvgElement',
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
} as Meta;
