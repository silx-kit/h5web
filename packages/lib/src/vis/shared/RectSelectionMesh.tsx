import SelectionMesh from './SelectionMesh';
import SelectionRect from './SelectionRect';

function RectSelectionMesh() {
  return <SelectionMesh selectionComponent={SelectionRect} />;
}

export default RectSelectionMesh;
