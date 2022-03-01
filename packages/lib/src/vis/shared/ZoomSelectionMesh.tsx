import { useThree } from '@react-three/fiber';

import type { ModifierKey, Selection } from '../models';
import { useAxisSystemContext } from './AxisSystemContext';
import SelectionMesh from './SelectionMesh';
import SelectionRect from './SelectionRect';
import { useMoveCameraTo } from './hooks';

interface Props {
  modifierKey?: ModifierKey;
}

function ZoomSelectionMesh(props: Props) {
  const { modifierKey } = props;

  const { dataToWorld } = useAxisSystemContext();
  const moveCameraTo = useMoveCameraTo();

  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const onSelectionEnd = (selection: Selection) => {
    const { startPoint: dataStartPoint, endPoint: dataEndPoint } = selection;

    // Work in world coordinates as we need to act on the world camera
    const startPoint = dataToWorld(dataStartPoint);
    const endPoint = dataToWorld(dataEndPoint);
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
    <SelectionMesh modifierKey={modifierKey} onSelectionEnd={onSelectionEnd}>
      {({ startPoint, endPoint }) => (
        <SelectionRect
          startPoint={startPoint}
          endPoint={endPoint}
          opacity={0}
          borderColor="black"
        />
      )}
    </SelectionMesh>
  );
}

export default ZoomSelectionMesh;
