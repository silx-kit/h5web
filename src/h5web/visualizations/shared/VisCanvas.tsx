import React, { ReactNode, useContext } from 'react';
import { Canvas } from 'react-three-fiber';
import { useMeasure } from 'react-use';
import styles from './VisCanvas.module.css';
import type { AxisConfig } from './models';
import { computeVisSize } from './utils';
import AxisSystem from './AxisSystem';
import AxisSystemProvider from './AxisSystemProvider';
import { VisContext } from '../../dataset-visualizer/VisProvider';

const AXIS_OFFSETS = { vertical: 72, horizontal: 36, fallback: 16 };

interface Props {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  aspectRatio?: number;
  children: ReactNode;
}

function VisCanvas(props: Props): JSX.Element {
  const { abscissaConfig, ordinateConfig, aspectRatio, children } = props;
  const visContextValue = useContext(VisContext);

  const [visAreaRef, visAreaSize] = useMeasure();

  const axisOffsets = {
    left: AXIS_OFFSETS.vertical,
    bottom: AXIS_OFFSETS.horizontal,
    right: AXIS_OFFSETS.fallback,
    top: AXIS_OFFSETS.fallback,
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
            <AxisSystemProvider
              abscissaConfig={abscissaConfig}
              ordinateConfig={ordinateConfig}
            >
              <AxisSystem axisOffsets={axisOffsets} />
              {/* Provide context again - https://github.com/react-spring/react-three-fiber/issues/262 */}
              <VisContext.Provider value={visContextValue}>
                {children}
              </VisContext.Provider>
            </AxisSystemProvider>
          </Canvas>
        </div>
      )}
    </div>
  );
}

export default VisCanvas;
