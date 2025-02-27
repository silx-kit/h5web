import { type ThreeEvent } from '@react-three/fiber';
import { useCallback } from 'react';

import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { type TileArray } from './models';
import { useTooltipStore } from './store';

export function useTooltipOnMoveHandler(): (
  evt: ThreeEvent<MouseEvent>,
  array: TileArray,
) => void {
  const setTooltipValue = useTooltipStore((state) => state.setTooltipValue);
  const { worldToData } = useVisCanvasContext();

  return useCallback(
    (evt, array) => {
      const { object, unprojectedPoint } = evt;
      const localVec = object.worldToLocal(unprojectedPoint.clone());
      const dataVec = worldToData(unprojectedPoint.clone());
      const [height, width] = array.shape;
      const val = array.get(
        Math.floor(localVec.y + height / 2),
        Math.floor(localVec.x + width / 2),
      );
      setTooltipValue(dataVec.x, dataVec.y, val);
      evt.stopPropagation();
    },
    [setTooltipValue, worldToData],
  );
}
