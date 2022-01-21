import type { Vector2 } from 'three';

import SelectionLine from './SelectionLine';
import SelectionMesh from './SelectionMesh';

interface Props {
  onSelection?: (startPoint: Vector2, endPoint: Vector2) => void;
}

function LineSelectionMesh(props: Props) {
  return <SelectionMesh selectionComponent={SelectionLine} {...props} />;
}

export default LineSelectionMesh;
