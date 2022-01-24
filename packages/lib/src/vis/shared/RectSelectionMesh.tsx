import type { Vector2 } from 'three';

import SelectionMesh from './SelectionMesh';
import SelectionRect from './SelectionRect';

interface Props {
  onSelection?: (startPoint: Vector2, endPoint: Vector2) => void;
}

function RectSelectionMesh(props: Props) {
  return <SelectionMesh selectionComponent={SelectionRect} {...props} />;
}

export default RectSelectionMesh;
