import { useThree } from '@react-three/fiber';
import { useFrameRendering } from '../hooks';
import type { AxisOffsets, Domain } from '../models';
import { useAxisSystemContext } from './AxisSystemContext';
import Html from './Html';
import styles from './AxisSystem.module.css';
import Axis from './Axis';

interface Props {
  axisOffsets: AxisOffsets;
  title?: string;
}

function AxisSystem(props: Props) {
  const { axisOffsets, title } = props;

  const { abscissaConfig, ordinateConfig, abscissaScale, ordinateScale } =
    useAxisSystemContext();

  const { position, zoom } = useThree((state) => state.camera);
  const canvasSize = useThree((state) => state.size);
  const { width, height } = canvasSize;

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
  );
}

export default AxisSystem;
