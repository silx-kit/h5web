import React, { ReactNode, CSSProperties } from 'react';
import { Canvas } from 'react-three-fiber';
import { useMeasure } from 'react-use';
import styles from './VisCanvas.module.css';
import { AxisOffsets } from './models';
import { computeSizeFromAspectRatio } from './utils';

interface Props {
  axisOffsets: AxisOffsets;
  aspectRatio?: number;
  children: ReactNode;
}

function VisCanvas(props: Props): JSX.Element {
  const { axisOffsets, aspectRatio, children } = props;

  const [visAreaRef, { width, height }] = useMeasure();
  const zeroSize = width === 0 && height === 0;

  const [leftAxisWidth, bottomAxisHeight] = axisOffsets;
  const visSize = aspectRatio
    ? ({
        ...computeSizeFromAspectRatio(
          width - leftAxisWidth,
          height - bottomAxisHeight,
          aspectRatio
        ),
        boxSizing: 'content-box',
      } as CSSProperties)
    : { width, height };

  return (
    <div ref={visAreaRef} className={styles.visArea}>
      {!zeroSize && (
        <div
          className={styles.vis}
          style={{
            ...visSize,
            paddingBottom: bottomAxisHeight,
            paddingLeft: leftAxisWidth,
          }}
        >
          <Canvas
            className={styles.canvasWrapper}
            orthographic
            invalidateFrameloop
          >
            <ambientLight />
            {children}
          </Canvas>
        </div>
      )}
    </div>
  );
}

export default VisCanvas;
