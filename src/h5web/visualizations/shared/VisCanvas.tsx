import React, { ReactElement, ReactNode } from 'react';
import { Canvas } from 'react-three-fiber';
import { useMeasure } from 'react-use';
import styles from './VisCanvas.module.css';
import { AxisConfig } from './models';
import { computeVisSize } from './utils';
import AxisSystem from './AxisSystem';
import AxisSystemContext from './AxisSystemContext';

const AXIS_OFFSETS = { vertical: 72, horizontal: 36, fallback: 16 };

interface Props {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  aspectRatio?: number;
  canvasTitle?: string;
  children: ReactNode;
}

function VisCanvas(props: Props): ReactElement {
  const {
    abscissaConfig,
    ordinateConfig,
    aspectRatio,
    canvasTitle,
    children,
  } = props;

  const [visAreaRef, visAreaSize] = useMeasure();

  const axisOffsets = {
    left: AXIS_OFFSETS.vertical,
    bottom: abscissaConfig.label
      ? AXIS_OFFSETS.horizontal + AXIS_OFFSETS.fallback
      : AXIS_OFFSETS.horizontal,
    right: AXIS_OFFSETS.fallback,
    top: canvasTitle ? AXIS_OFFSETS.horizontal : AXIS_OFFSETS.fallback,
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
            <AxisSystemContext.Provider
              value={{ abscissaConfig, ordinateConfig }}
            >
              <AxisSystem title={canvasTitle} axisOffsets={axisOffsets} />
              {children}
            </AxisSystemContext.Provider>
          </Canvas>
        </div>
      )}
    </div>
  );
}

export type { Props as VisCanvasProps };
export default VisCanvas;
