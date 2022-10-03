import { ScaleType } from '@h5web/shared';
import type { ThreeEvent } from '@react-three/fiber';
import { useCallback } from 'react';

import type { Size } from '../models';
import { useAxisSystemContext } from '../shared/AxisSystemProvider';
import { createAxisScale } from '../utils';
import type { TileArray } from './models';
import { useTooltipStore } from './store';

export function useLayerScales(layerSize: Size, meshSize: Size) {
  const { abscissaConfig, ordinateConfig } = useAxisSystemContext();

  const xScale = createAxisScale(ScaleType.Linear, {
    domain: [-meshSize.width / 2, meshSize.width / 2],
    range: [0, layerSize.width],
    reverse: abscissaConfig.flip,
    clamp: true,
  });

  const yScale = createAxisScale(ScaleType.Linear, {
    domain: [-meshSize.height / 2, meshSize.height / 2],
    range: [0, layerSize.height],
    reverse: ordinateConfig.flip,
    clamp: true,
  });

  return { xScale, yScale };
}

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
