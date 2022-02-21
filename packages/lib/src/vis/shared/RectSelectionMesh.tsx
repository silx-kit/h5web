import type { Color } from '@react-three/fiber';

import type { SelectionMeshProps } from './SelectionMesh';
import SelectionMesh from './SelectionMesh';
import SelectionRect from './SelectionRect';

interface Props extends Omit<SelectionMeshProps, 'children'> {
  color?: Color;
  opacity?: number;
}

function RectSelectionMesh(props: Props) {
  const { color, opacity, ...meshProps } = props;
  return (
    <SelectionMesh {...meshProps}>
      {(startPoint, endPoint) => (
        <SelectionRect
          startPoint={startPoint}
          endPoint={endPoint}
          color={color}
          opacity={opacity}
        />
      )}
    </SelectionMesh>
  );
}

export default RectSelectionMesh;
