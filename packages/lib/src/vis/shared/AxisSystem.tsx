import { createPortal } from 'react-dom';

import { useCameraState } from '../hooks';
import type { AxisOffsets } from '../models';
import Axis from './Axis';
import Html from './Html';
import { useVisCanvasContext } from './VisCanvasProvider';

interface Props {
  axisOffsets: AxisOffsets;
  showAxes: boolean;
}

function AxisSystem(props: Props) {
  const { axisOffsets, showAxes } = props;
  const {
    canvasSize,
    visCanvas,
    abscissaConfig,
    ordinateConfig,
    getVisibleDomains,
  } = useVisCanvasContext();

  const visibleDomains = useCameraState(getVisibleDomains, [getVisibleDomains]);

  return (
    <Html>
      {createPortal(
        <>
          <Axis
            type="abscissa"
            config={abscissaConfig}
            domain={visibleDomains.xVisibleDomain}
            canvasSize={canvasSize}
            offset={axisOffsets.bottom}
            showAxis={showAxes}
          />
          <Axis
            type="ordinate"
            config={ordinateConfig}
            domain={visibleDomains.yVisibleDomain}
            canvasSize={canvasSize}
            offset={axisOffsets.left}
            showAxis={showAxes}
            flipAxis
          />
        </>,
        visCanvas,
      )}
    </Html>
  );
}

export default AxisSystem;
