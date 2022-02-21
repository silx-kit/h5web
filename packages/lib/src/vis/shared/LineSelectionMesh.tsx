import type { Color } from '@react-three/fiber';

import SelectionLine from './SelectionLine';
import type { SelectionMeshProps } from './SelectionMesh';
import SelectionMesh from './SelectionMesh';

interface Props extends Omit<SelectionMeshProps, 'children'> {
  color?: Color;
}

function LineSelectionMesh(props: Props) {
  const { color, ...meshProps } = props;
  return (
    <SelectionMesh {...meshProps}>
      {(startPoint, endPoint) => (
        <SelectionLine
          startPoint={startPoint}
          endPoint={endPoint}
          color={color}
          {...props}
        />
      )}
    </SelectionMesh>
  );
}

export default LineSelectionMesh;
