import type { ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import Html from './Html';
import styles from './AxisSystem.module.css';
import type { AxisConfig, AxisOffsets, Domain } from '../models';
import { useFrameRendering } from '../hooks';
import Axis from './Axis';
import AxisSystemContext from './AxisSystemContext';
import { getCanvasScale } from '../utils';

interface Props {
  axisOffsets: AxisOffsets;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  children: ReactNode;
  title?: string;
}

function AxisSystem(props: Props) {
  const { axisOffsets, abscissaConfig, ordinateConfig, title, children } =
    props;

  const { position, zoom } = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const { width, height } = size;

  const abscissaScale = getCanvasScale(abscissaConfig, width);
  const ordinateScale = getCanvasScale(ordinateConfig, width);

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
          canvasSize={size}
        />
        <Axis
          type="ordinate"
          config={ordinateConfig}
          domain={yVisibleDomain}
          canvasSize={size}
          flipAxis
        />
      </Html>
      <AxisSystemContext.Provider value={{ abscissaConfig, ordinateConfig }}>
        {children}
      </AxisSystemContext.Provider>
    </>
  );
}

export type { Props as AxisSystemProps };
export default AxisSystem;
