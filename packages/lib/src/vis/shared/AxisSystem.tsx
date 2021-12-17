import type { Domain } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import { useFrameRendering } from '../hooks';
import type { AxisOffsets } from '../models';
import Axis from './Axis';
import styles from './AxisSystem.module.css';
import { useAxisSystemContext } from './AxisSystemContext';
import Html from './Html';

interface Props {
  axisOffsets: AxisOffsets;
  title?: string;
}

const CAMERA_BOTTOM_LEFT = new Vector3(-1, -1, 0);
const CAMERA_TOP_RIGHT = new Vector3(1, 1, 0);

function AxisSystem(props: Props) {
  const { axisOffsets, title } = props;

  const { abscissaConfig, ordinateConfig, abscissaScale, ordinateScale } =
    useAxisSystemContext();

  const camera = useThree((state) => state.camera);
  const canvasSize = useThree((state) => state.size);
  const { width, height } = canvasSize;

  const worldBottomLeft = CAMERA_BOTTOM_LEFT.clone().unproject(camera);
  const worldTopRight = CAMERA_TOP_RIGHT.clone().unproject(camera);

  const xVisibleDomain: Domain = [
    abscissaScale.invert(worldBottomLeft.x), // left
    abscissaScale.invert(worldTopRight.x), // right
  ];

  const yVisibleDomain: Domain = [
    ordinateScale.invert(worldBottomLeft.y), // bottom
    ordinateScale.invert(worldTopRight.y), // top
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
      {title && <p className={styles.title}>{title}</p>}
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
