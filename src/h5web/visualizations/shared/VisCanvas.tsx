import React, { ReactNode } from 'react';
import { Canvas } from 'react-three-fiber';
import { useMeasure } from 'react-use';
import styles from './VisCanvas.module.css';
import { AxisOffsets, AxisDomains } from './models';
import { computeVisSize } from './utils';
import AxisGrid from './AxisGrid';

interface Props {
  axisDomains: AxisDomains;
  axisOffsets: AxisOffsets;
  aspectRatio?: number;
  children: ReactNode;
}

function VisCanvas(props: Props): JSX.Element {
  const { axisDomains, axisOffsets, aspectRatio, children } = props;
  const [visAreaRef, visAreaSize] = useMeasure();

  const visSize = computeVisSize(visAreaSize, axisOffsets, aspectRatio);

  return (
    <div ref={visAreaRef} className={styles.visArea}>
      {visSize && (
        <div
          className={styles.vis}
          style={{
            ...visSize,
            paddingBottom: axisOffsets.bottom,
            paddingLeft: axisOffsets.left,
            boxSizing: 'content-box',
          }}
        >
          <Canvas
            className={styles.canvasWrapper}
            orthographic
            invalidateFrameloop
          >
            <ambientLight />
            <AxisGrid axisDomains={axisDomains} axisOffsets={axisOffsets} />
            {children}
          </Canvas>
        </div>
      )}
    </div>
  );
}

export default VisCanvas;
