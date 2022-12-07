import type { Axis } from '@h5web/shared';
import { useThree } from '@react-three/fiber';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import AxialSelectionTool from './AxialSelectionTool';
import SelectionRect from './SelectionRect';
import { useMoveCameraTo } from './hooks';
import type { Selection, CommonInteractionProps } from './models';
import { getEnclosedRectangle } from './utils';

interface Props extends CommonInteractionProps {
  axis: Axis;
}

function AxialSelectToZoom(props: Props) {
  const { axis, modifierKey, disabled } = props;

  const { canvasSize, visRatio } = useVisCanvasContext();
  const moveCameraTo = useMoveCameraTo();

  const { width, height } = canvasSize;
  const camera = useThree((state) => state.camera);

  function onSelectionEnd(selection: Selection) {
    const [worldStart, worldEnd] = selection.world;
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
    <AxialSelectionTool
      axis={axis}
      id={`${axis.toUpperCase()}SelectToZoom`}
      modifierKey={modifierKey}
      disabled={visRatio !== undefined || disabled}
      onSelectionEnd={onSelectionEnd}
    >
      {({ data: [dataStart, dataEnd] }) => (
        <SelectionRect
          fill="white"
          stroke="black"
          fillOpacity={0.25}
          startPoint={dataStart}
          endPoint={dataEnd}
        />
      )}
    </AxialSelectionTool>
  );
}

export type { Props as AxialSelectToZoomProps };
export default AxialSelectToZoom;
