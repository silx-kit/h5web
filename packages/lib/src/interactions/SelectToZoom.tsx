import { useThree } from '@react-three/fiber';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import RatioSelectionRect from './RatioSelectionRect';
import SelectionRect from './SelectionRect';
import SelectionTool from './SelectionTool';
import { useMoveCameraTo } from './hooks';
import type { CommonInteractionProps, Selection } from './models';
import { getEnclosedRectangle, getRatioRespectingRectangle } from './utils';

type Props = CommonInteractionProps;

function SelectToZoom(props: Props) {
  const { canvasSize, canvasRatio, visRatio, dataToWorld } =
    useVisCanvasContext();

  const { width, height } = canvasSize;
  const keepRatio = visRatio !== undefined;

  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  function onSelectionEnd(selection: Selection) {
    const [worldStart, worldEnd] = getRatioRespectingRectangle(
      ...selection.data,
      keepRatio ? canvasRatio : undefined
    ).map(dataToWorld); // work in world coordinates as we need to act on the world camera

    if (worldStart.x === worldEnd.x || worldStart.y === worldEnd.y) {
      return;
    }

    const zoomRect = getEnclosedRectangle(worldStart, worldEnd);
    const { center: zoomRectCenter } = zoomRect;

    // Change scale first so that moveCameraTo computes the updated camera bounds
    camera.scale.set(zoomRect.width / width, zoomRect.height / height, 1);
    camera.updateMatrixWorld();

    moveCameraTo(zoomRectCenter);
  }

  return (
    <SelectionTool id="SelectToZoom" onSelectionEnd={onSelectionEnd} {...props}>
      {({ data: [dataStart, dataEnd] }) => (
        <>
          <SelectionRect
            startPoint={dataStart}
            endPoint={dataEnd}
            fill="white"
            stroke="black"
            fillOpacity={keepRatio ? 0 : 0.25}
            strokeDasharray={keepRatio ? '4' : undefined}
          />
          {keepRatio && (
            <RatioSelectionRect
              startPoint={dataStart}
              endPoint={dataEnd}
              ratio={canvasRatio}
              fillOpacity={0.25}
              fill="white"
              stroke="black"
            />
          )}
        </>
      )}
    </SelectionTool>
  );
}

export type { Props as SelectToZoomProps };
export default SelectToZoom;
