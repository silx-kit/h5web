import { useThree } from '@react-three/fiber';

import { useVisibleDomains } from '../vis/hooks';
import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import RatioSelectionRect from './RatioSelectionRect';
import SelectionRect from './SelectionRect';
import SelectionTool from './SelectionTool';
import { useMoveCameraTo } from './hooks';
import type { Interaction, Selection } from './models';
import { getEnclosedRectangle, getRatioEndPoint } from './utils';

interface Props extends Interaction {
  keepRatio?: boolean;
}

function SelectToZoom(props: Props) {
  const { keepRatio, ...interactionProps } = props;

  const { dataToWorld } = useAxisSystemContext();
  const moveCameraTo = useMoveCameraTo();

  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const { xVisibleDomain, yVisibleDomain } = useVisibleDomains();
  const dataRatio = Math.abs(
    (xVisibleDomain[1] - xVisibleDomain[0]) /
      (yVisibleDomain[1] - yVisibleDomain[0])
  );

  const onSelectionEnd = (selection: Selection) => {
    const { startPoint: dataStartPoint, endPoint: dataEndPoint } = selection;

    // Work in world coordinates as we need to act on the world camera
    const startPoint = dataToWorld(dataStartPoint);
    const endPoint = dataToWorld(
      keepRatio
        ? getRatioEndPoint(dataStartPoint, dataEndPoint, dataRatio)
        : dataEndPoint
    );

    if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
      return;
    }

    const selectedRect = getEnclosedRectangle(startPoint, endPoint);
    const { center: selectionCenter } = selectedRect;

    // Change scale first so that moveCameraTo computes the updated camera bounds
    camera.scale.set(
      selectedRect.width / width,
      selectedRect.height / height,
      1
    );
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    moveCameraTo(selectionCenter.x, selectionCenter.y);
  };

  return (
    <SelectionTool
      onSelectionEnd={onSelectionEnd}
      id="SelectToZoom"
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

export default SelectToZoom;
