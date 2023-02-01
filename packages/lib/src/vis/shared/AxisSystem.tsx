import { useCameraState } from '../hooks';
import type { AxisOffsets } from '../models';
import Axis from './Axis';
import styles from './AxisSystem.module.css';
import Html from './Html';
import { useVisCanvasContext } from './VisCanvasProvider';

interface Props {
  axisOffsets: AxisOffsets;
  title?: string;
  showAxes: boolean;
}

function AxisSystem(props: Props) {
  const { axisOffsets, title, showAxes } = props;
  const { canvasSize, abscissaConfig, ordinateConfig, getVisibleDomains } =
    useVisCanvasContext();

  const visibleDomains = useCameraState(getVisibleDomains, [getVisibleDomains]);
  const { xVisibleDomain, yVisibleDomain } = visibleDomains;

  return (
    // Append to `canvasWrapper` instead of `r3fRoot`
    <Html overflowCanvas>
      <div
        className={styles.axisSystem}
        style={{
          gridTemplateColumns: `${axisOffsets.left}px 1fr ${axisOffsets.right}px`,
          gridTemplateRows: `${axisOffsets.top}px 1fr ${axisOffsets.bottom}px`,
        }}
      >
        {showAxes && title && <p className={styles.title}>{title}</p>}
        <Axis
          type="abscissa"
          config={abscissaConfig}
          domain={xVisibleDomain}
          canvasSize={canvasSize}
          offset={axisOffsets.bottom}
          showAxis={showAxes}
        />
        <Axis
          type="ordinate"
          config={ordinateConfig}
          domain={yVisibleDomain}
          canvasSize={canvasSize}
          offset={axisOffsets.left}
          showAxis={showAxes}
          flipAxis
        />
      </div>
    </Html>
  );
}

export default AxisSystem;
