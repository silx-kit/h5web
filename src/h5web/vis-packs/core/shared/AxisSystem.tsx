import { useContext } from 'react';
import { useThree } from 'react-three-fiber';
import Html from './Html';
import styles from './AxisSystem.module.css';
import type { AxisOffsets, Domain } from '../models';
import { useFrameRendering, useCanvasScales } from '../hooks';
import Axis from './Axis';
import AxisSystemContext from './AxisSystemContext';

interface Props {
  axisOffsets: AxisOffsets;
  title?: string;
}

function AxisSystem(props: Props) {
  const { axisOffsets, title } = props;

  const { abscissaConfig, ordinateConfig } = useContext(AxisSystemContext);

  const { camera, size } = useThree();
  const { position, zoom } = camera;
  const { width, height } = size;

  const { abscissaScale, ordinateScale } = useCanvasScales();

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
  );
}

export default AxisSystem;
