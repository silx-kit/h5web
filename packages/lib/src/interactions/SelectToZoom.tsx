import { useThree } from '@react-three/fiber';

import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import SelectionRect from './SelectionRect';
import SelectionTool from './SelectionTool';
import { useMoveCameraTo } from './hooks';
import type { ModifierKey, Selection } from './models';
import { getRatioEndPoint } from './utils';

interface Props {
  modifierKey?: ModifierKey;
  keepRatio?: boolean;
}

function SelectToZoom(props: Props) {
  const { modifierKey = 'Control', keepRatio } = props;

  const { dataToWorld } = useAxisSystemContext();
  const moveCameraTo = useMoveCameraTo();

  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const onSelectionEnd = (selection: Selection) => {
    const { startPoint: dataStartPoint, endPoint: dataEndPoint } = selection;

    // Work in world coordinates as we need to act on the world camera
    const startPoint = dataToWorld(dataStartPoint);
    const endPoint = dataToWorld(
      keepRatio
        ? getRatioEndPoint(dataStartPoint, dataEndPoint, width / height)
        : dataEndPoint
    );
    if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
      return;
    }

    const selectionWidth = Math.abs(endPoint.x - startPoint.x);
    const selectionHeight = Math.abs(endPoint.y - startPoint.y);

    // Change scale first so that moveCameraTo computes the updated camera bounds
    camera.scale.set(selectionWidth / width, selectionHeight / height, 1);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const selectionCenter = endPoint
      .clone()
      .sub(startPoint)
      .divideScalar(2)
      .add(startPoint);

    moveCameraTo(selectionCenter.x, selectionCenter.y);
  };

  return (
    <SelectionTool modifierKey={modifierKey} onSelectionEnd={onSelectionEnd}>
      {({ startPoint, endPoint }) => (
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
            <SelectionRect
              startPoint={startPoint}
              endPoint={getRatioEndPoint(startPoint, endPoint, width / height)}
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

export default SelectToZoom;
