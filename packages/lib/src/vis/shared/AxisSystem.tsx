import { useThree } from '@react-three/fiber';

import { useCameraState } from '../hooks';
import type { AxisOffsets } from '../models';
import { getVisibleDomains } from '../utils';
import Axis from './Axis';
import styles from './AxisSystem.module.css';
import { useAxisSystemContext } from './AxisSystemProvider';
import Overlay from './Overlay';

interface Props {
  axisOffsets: AxisOffsets;
  title?: string;
}

function AxisSystem(props: Props) {
  const { axisOffsets, title } = props;

  const canvasSize = useThree((state) => state.size);
  const { width, height } = canvasSize;

  const { abscissaConfig, ordinateConfig } = useAxisSystemContext();
  const { xVisibleDomain, yVisibleDomain } = useCameraState(
    getVisibleDomains,
    []
  );

  return (
    <Overlay
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
        svgSize={{ width, height: axisOffsets.bottom }}
      />
      <Axis
        type="ordinate"
        config={ordinateConfig}
        domain={yVisibleDomain}
        canvasSize={canvasSize}
        svgSize={{ width: axisOffsets.left, height }}
        flipAxis
      />
    </Overlay>
  );
}

export default AxisSystem;
