import SelectionLine from './SelectionLine';
import SelectionMesh from './SelectionMesh';

function LineSelectionMesh() {
  return <SelectionMesh selectionComponent={SelectionLine} />;
}

export default LineSelectionMesh;
