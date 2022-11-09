import type { ThreeEvent } from '@react-three/fiber';
import { useCallback } from 'react';

import { useAxisSystemContext } from '../shared/AxisSystemProvider';
import type { TileArray } from './models';
import { useTooltipStore } from './store';

export function useTooltipOnMoveHandler() {
  const setTooltipValue = useTooltipStore((state) => state.setTooltipValue);
  const { worldToData } = useAxisSystemContext();

  return useCallback(
    (evt: ThreeEvent<MouseEvent>, array: TileArray) => {
      const { unprojectedPoint } = evt;
      const localVec = evt.object.worldToLocal(unprojectedPoint.clone());
      const dataVec = worldToData(unprojectedPoint.clone());
      const [height, width] = array.shape;
      const val = array.get(
        Math.floor(localVec.y + height / 2),
        Math.floor(localVec.x + width / 2)
      );
      setTooltipValue(dataVec.x, dataVec.y, val);
      evt.stopPropagation();
    },
    [setTooltipValue, worldToData]
  );
}
