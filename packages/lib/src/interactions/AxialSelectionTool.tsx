import type { Axis } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import { getWorldFOV } from '../vis/utils';
import type { SelectionToolProps } from './SelectionTool';
import SelectionTool from './SelectionTool';
import type { Rect, Selection } from './models';

interface Props extends SelectionToolProps {
  axis: Axis;
}

function AxialSelectionTool(props: Props) {
  const {
    axis,
    onSelectionStart,
    onSelectionChange,
    onSelectionEnd,
    children,
    ...restOfSelectionProps
  } = props;

  const { worldToData } = useVisCanvasContext();
  const camera = useThree((state) => state.camera);

  function toAxialSelection(selection: Selection): Selection {
    const [worldStart, worldEnd] = selection.world;
    const { bottomLeft, topRight } = getWorldFOV(camera);

    const axialWorldSelection: Rect =
      axis === 'x'
        ? [
            new Vector3(worldStart.x, bottomLeft.y, 0),
            new Vector3(worldEnd.x, topRight.y, 0),
          ]
        : [
            new Vector3(bottomLeft.x, worldStart.y, 0),
            new Vector3(topRight.x, worldEnd.y, 0),
          ];

    return {
      world: axialWorldSelection,
      data: axialWorldSelection.map(worldToData) as Rect,
    };
  }

  return (
    <SelectionTool
      transformSelection={toAxialSelection}
      onSelectionStart={onSelectionStart}
      onSelectionChange={onSelectionChange}
      onSelectionEnd={onSelectionEnd}
      {...restOfSelectionProps}
    >
      {children}
    </SelectionTool>
  );
}

export type { Props as AxialSelectionToolProps };
export default AxialSelectionTool;
