import React, { ReactNode } from 'react';
import { Canvas } from 'react-three-fiber';
import { useMeasure } from 'react-use';
import styles from './VisCanvas.module.css';
import { AxisOffsets, AxisDomains } from './models';
import { computeVisSize } from './utils';
import AxisSystem from './AxisSystem';

interface Props {
  axisOffsets: AxisOffsets;
  axisDomains?: AxisDomains;
  aspectRatio?: number;
  showGrid?: boolean;
  children: ReactNode;
}

function VisCanvas(props: Props): JSX.Element {
  const { axisDomains, axisOffsets, aspectRatio, children, showGrid } = props;
  const [visAreaRef, visAreaSize] = useMeasure();
  const availableSize = {
    width: visAreaSize.width - axisOffsets.left,
    height: visAreaSize.height - axisOffsets.bottom,
  };

  const visSize = computeVisSize(availableSize, aspectRatio);

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
            invalidateFrameloop // disable game loop
            gl={{ preserveDrawingBuffer: true }} // for screenshot feature
          >
            <ambientLight />
            {axisDomains && (
              <AxisSystem
                axisDomains={axisDomains}
                axisOffsets={axisOffsets}
                showGrid={showGrid}
              />
            )}
            {children}
          </Canvas>
        </div>
      )}
    </div>
  );
}

export default VisCanvas;
