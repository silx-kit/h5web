import type { SelectionMeshProps } from './SelectionMesh';
import SelectionMesh from './SelectionMesh';
import SelectionRect from './SelectionRect';

function RectSelectionMesh(props: SelectionMeshProps) {
  return <SelectionMesh selectionComponent={SelectionRect} {...props} />;
}

export default RectSelectionMesh;
