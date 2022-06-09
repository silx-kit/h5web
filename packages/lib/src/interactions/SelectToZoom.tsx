import { useThree } from '@react-three/fiber';

import { useCameraState } from '../vis/hooks';
import { useAxisSystemContext } from '../vis/shared/AxisSystemProvider';
import { getVisibleDomains } from '../vis/utils';
import SelectionRect from './SelectionRect';
import SelectionTool from './SelectionTool';
import { useMoveCameraTo } from './hooks';
import type { Interaction, Selection } from './models';
import { getEnclosedRectangle, getZoomTransform } from './utils';

interface Props extends Omit<Interaction, 'button'> {
  keepRatio?: boolean;
  fullDimIfEmpty?: boolean;
}

function SelectToZoom(props: Props) {
  const { keepRatio, fullDimIfEmpty, ...interactionProps } = props;

  const transform = getZoomTransform(keepRatio, fullDimIfEmpty);

  const { dataToWorld } = useAxisSystemContext();
  const moveCameraTo = useMoveCameraTo();

  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const { xVisibleDomain, yVisibleDomain } = useCameraState(
    getVisibleDomains,
    []
  );

  function onSelectionEnd(selection: Selection) {
    const { startPoint: dataStartPoint, endPoint: dataEndPoint } = selection;

    // Work in world coordinates as we need to act on the world camera
    const [startPoint, endPoint] = transform(
      dataStartPoint,
      dataEndPoint,
      xVisibleDomain,
      yVisibleDomain
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
      onSelectionEnd={onSelectionEnd}
      id="SelectToZoom"
      {...interactionProps}
    >
      {({ startPoint, endPoint }) => {
        const [newStartPoint, newEndPoint] = transform(
          startPoint,
          endPoint,
          xVisibleDomain,
          yVisibleDomain
        );
        return (
          <>
            <SelectionRect
              startPoint={newStartPoint}
              endPoint={newEndPoint}
              fill="white"
              stroke="black"
              fillOpacity={0.25}
              clampToVis
            />
            {/* Draw un-transformed user-drawn rectangle */}
            {keepRatio && (
              <SelectionRect
                startPoint={startPoint}
                endPoint={endPoint}
                stroke="black"
                fillOpacity={0}
                strokeDasharray="4"
              />
            )}
          </>
        );
      }}
    </SelectionTool>
  );
}

export default SelectToZoom;
