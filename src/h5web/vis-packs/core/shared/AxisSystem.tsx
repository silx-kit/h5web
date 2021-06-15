import type { ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import Html from './Html';
import styles from './AxisSystem.module.css';
import type { AxisConfig, AxisOffsets, Domain } from '../models';
import { useFrameRendering, useVisSize } from '../hooks';
import Axis from './Axis';
import AxisSystemContext from './AxisSystemContext';
import { getCanvasScale } from '../utils';

interface Props {
  axisOffsets: AxisOffsets;
  visRatio?: number;
  title?: string;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  children: ReactNode;
}

function AxisSystem(props: Props) {
  const {
    axisOffsets,
    visRatio,
    title,
    abscissaConfig,
    ordinateConfig,
    children,
  } = props;

  const { position, zoom } = useThree((state) => state.camera);
  const canvasSize = useThree((state) => state.size);
  const { width, height } = canvasSize;

  const visSize = useVisSize(visRatio);
  const abscissaScale = getCanvasScale(abscissaConfig, visSize.width);
  const ordinateScale = getCanvasScale(ordinateConfig, visSize.height);

  // Find visible domains from camera's zoom and position
  const xVisibleDomain: Domain = [
    abscissaScale.invert(-width / (2 * zoom) + position.x),
    abscissaScale.invert(width / (2 * zoom) + position.x),
  ];

  const yVisibleDomain: Domain = [
    ordinateScale.invert(-height / (2 * zoom) + position.y),
    ordinateScale.invert(height / (2 * zoom) + position.y),
  ];

  // Re-render on every R3F frame (i.e. on every change of camera zoom/position)
  useFrameRendering();

  return (
    <>
      <Html
        className={styles.axisSystem}
        style={{
          // Take over space reserved for axis by VisCanvas
          top: -axisOffsets.top,
          left: -axisOffsets.left,
          width: width + axisOffsets.left + axisOffsets.right,
          height: height + axisOffsets.bottom + axisOffsets.top,
          gridTemplateColumns: `${axisOffsets.left}px 1fr ${axisOffsets.right}px`,
          gridTemplateRows: `${axisOffsets.top}px 1fr ${axisOffsets.bottom}px`,
        }}
      >
        {title && (
          <p id="vis-title" className={styles.title}>
            {title}
          </p>
        )}
        <Axis
          type="abscissa"
          config={abscissaConfig}
          domain={xVisibleDomain}
          canvasSize={canvasSize}
        />
        <Axis
          type="ordinate"
          config={ordinateConfig}
          domain={yVisibleDomain}
          canvasSize={canvasSize}
          flipAxis
        />
      </Html>
      <AxisSystemContext.Provider
        value={{
          abscissaConfig,
          ordinateConfig,
          abscissaScale,
          ordinateScale,
          visSize,
        }}
      >
        {children}
      </AxisSystemContext.Provider>
    </>
  );
}

export type { Props as AxisSystemProps };
export default AxisSystem;
