import { useThree } from '@react-three/fiber';

import { useCameraState } from '../vis/hooks';
import { useAxisSystemContext } from '../vis/shared/AxisSystemProvider';
import { getVisibleDomains } from '../vis/utils';
import RatioSelectionRect from './RatioSelectionRect';
import SelectionRect from './SelectionRect';
import SelectionTool from './SelectionTool';
import { useMoveCameraTo } from './hooks';
import type { CommonInteractionProps, Selection } from './models';
import { getEnclosedRectangle, getRatioRespectingRectangle } from './utils';

interface Props extends CommonInteractionProps {
  keepRatio?: boolean;
}

function SelectToZoom(props: Props) {
  const { keepRatio, ...interactionProps } = props;

  const { dataToWorld } = useAxisSystemContext();
  const moveCameraTo = useMoveCameraTo();

  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const { xVisibleDomain, yVisibleDomain } = useCameraState(
    getVisibleDomains,
    []
  );
  const dataRatio = Math.abs(
    (xVisibleDomain[1] - xVisibleDomain[0]) /
      (yVisibleDomain[1] - yVisibleDomain[0])
  );

  function onSelectionEnd(selection: Selection) {
    const { startPoint: dataStartPoint, endPoint: dataEndPoint } = selection;

    // Work in world coordinates as we need to act on the world camera
    const [startPoint, endPoint] = (
      keepRatio
        ? getRatioRespectingRectangle(dataStartPoint, dataEndPoint, dataRatio)
        : [dataStartPoint, dataEndPoint]
    ).map(dataToWorld);

    if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
      return;
    }

    const zoomRect = getEnclosedRectangle(startPoint, endPoint);
    const { center: zoomRectCenter } = zoomRect;

    // Change scale first so that moveCameraTo computes the updated camera bounds
    camera.scale.set(zoomRect.width / width, zoomRect.height / height, 1);
    camera.updateMatrixWorld();

    moveCameraTo(zoomRectCenter.x, zoomRectCenter.y);
  }

  return (
    <SelectionTool
      id="SelectToZoom"
      onSelectionEnd={onSelectionEnd}
      {...interactionProps}
    >
      {({ startPoint, endPoint }) => {
        return (
          <>
            <SelectionRect
              startPoint={startPoint}
              endPoint={endPoint}
              fill="white"
              stroke="black"
              fillOpacity={keepRatio ? 0 : 0.25}
              strokeDasharray={keepRatio ? '4' : undefined}
            />
            {keepRatio && (
              <RatioSelectionRect
                startPoint={startPoint}
                endPoint={endPoint}
                ratio={dataRatio}
                fillOpacity={0.25}
                fill="white"
                stroke="black"
              />
            )}
          </>
        );
      }}
    </SelectionTool>
  );
}

export type { Props as SelectToZoomProps };
export default SelectToZoom;
