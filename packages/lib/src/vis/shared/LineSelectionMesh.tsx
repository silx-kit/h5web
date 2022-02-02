import SelectionLine from './SelectionLine';
import type { SelectionMeshProps } from './SelectionMesh';
import SelectionMesh from './SelectionMesh';

function LineSelectionMesh(props: SelectionMeshProps) {
  return <SelectionMesh selectionComponent={SelectionLine} {...props} />;
}

export default LineSelectionMesh;
