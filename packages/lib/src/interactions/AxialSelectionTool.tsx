import type { Axis } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import { useCallback } from 'react';
import { Vector3 } from 'three';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import { getWorldFOV } from '../vis/utils';
import type { SelectionProps } from './SelectionTool';
import SelectionTool from './SelectionTool';
import type { Selection } from './models';

interface Props extends SelectionProps {
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

  const toAxialSelection = useCallback(
    (selection: Selection): Selection => {
      const { worldStartPoint, worldEndPoint } = selection;
      const { bottomLeft, topRight } = getWorldFOV(camera);

      const axialWorldStartPoint =
        axis === 'x'
          ? new Vector3(worldStartPoint.x, bottomLeft.y, 0)
          : new Vector3(bottomLeft.x, worldStartPoint.y, 0);

      const axialWorldEndPoint =
        axis === 'x'
          ? new Vector3(worldEndPoint.x, topRight.y, 0)
          : new Vector3(topRight.x, worldEndPoint.y, 0);

      return {
        startPoint: worldToData(axialWorldStartPoint),
        endPoint: worldToData(axialWorldEndPoint),
        worldStartPoint: axialWorldStartPoint,
        worldEndPoint: axialWorldEndPoint,
      };
    },
    [axis, camera, worldToData]
  );

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

export default AxialSelectionTool;
