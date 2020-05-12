import React, { ReactNode } from 'react';
import { Canvas } from 'react-three-fiber';
import { useMeasure } from 'react-use';
import styles from './VisCanvas.module.css';
import { AxisDomains } from './models';
import { computeVisSize } from './utils';
import AxisSystem from './AxisSystem';
import AxisSystemProvider from './AxisSystemProvider';

const AXIS_OFFSETS = { vertical: 72, horizontal: 36, fallback: 10 };

interface Props {
  axisDomains?: AxisDomains;
  aspectRatio?: number;
  showGrid?: boolean;
  hasXLogScale?: boolean;
  hasYLogScale?: boolean;
  children: ReactNode;
}

function VisCanvas(props: Props): JSX.Element {
  const {
    axisDomains,
    aspectRatio,
    children,
    showGrid,
    hasXLogScale,
    hasYLogScale,
  } = props;
  const [visAreaRef, visAreaSize] = useMeasure();

  const axisOffsets = {
    left: axisDomains ? AXIS_OFFSETS.vertical : AXIS_OFFSETS.fallback,
    right: AXIS_OFFSETS.fallback,
    top: AXIS_OFFSETS.fallback,
    bottom: axisDomains ? AXIS_OFFSETS.horizontal : AXIS_OFFSETS.fallback,
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
              <AxisSystemProvider
                axisDomains={axisDomains}
                showGrid={showGrid}
                hasXLogScale={hasXLogScale}
                hasYLogScale={hasYLogScale}
              >
                <AxisSystem axisOffsets={axisOffsets} />
                {children}
              </AxisSystemProvider>
            )}
          </Canvas>
        </div>
      )}
    </div>
  );
}

export default VisCanvas;
