import React, { ReactNode } from 'react';
import { Canvas } from 'react-three-fiber';
import { useMeasure } from 'react-use';
import styles from './VisCanvas.module.css';
import { AxisDomains } from './models';
import { computeVisSize } from './utils';
import AxisSystem from './AxisSystem';

const AXIS_OFFSETS = { vertical: 72, horizontal: 36, fallback: 10 };

interface Props {
  axisDomains?: AxisDomains;
  aspectRatio?: number;
  showGrid?: boolean;
  children: ReactNode;
}

function VisCanvas(props: Props): JSX.Element {
  const { axisDomains, aspectRatio, children, showGrid } = props;
  const [visAreaRef, visAreaSize] = useMeasure();

  const axisOffsets = {
    left:
      axisDomains && axisDomains.left
        ? AXIS_OFFSETS.vertical
        : AXIS_OFFSETS.fallback,
    right:
      axisDomains && axisDomains.right
        ? AXIS_OFFSETS.vertical
        : AXIS_OFFSETS.fallback,
    top:
      axisDomains && axisDomains.top
        ? AXIS_OFFSETS.horizontal
        : AXIS_OFFSETS.fallback,
    bottom:
      axisDomains && axisDomains.bottom
        ? AXIS_OFFSETS.horizontal
        : AXIS_OFFSETS.fallback,
  };

  const availableSize = {
    width: visAreaSize.width - axisOffsets.left - axisOffsets.right,
    height: visAreaSize.height - axisOffsets.bottom - axisOffsets.top,
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
            paddingTop: axisOffsets.top,
            paddingRight: axisOffsets.right,
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
