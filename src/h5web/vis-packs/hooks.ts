import { useState } from 'react';
import type { DimensionMapping } from '../dimension-mapper/models';
import type { VisDef } from './models';

export function useActiveVis<T extends VisDef>(supportedVis: T[]) {
  const lastVis = supportedVis[supportedVis.length - 1];

  const state = useState<T | undefined>(lastVis);
  const [activeVis, setActiveVis] = state;

  if (activeVis && supportedVis.length === 0) {
    setActiveVis(undefined);
  } else if (
    (!activeVis && lastVis) ||
    (activeVis && !supportedVis.includes(activeVis))
  ) {
    setActiveVis(lastVis);
  }

  return state;
}

export function useDimMappingState(dims: number[], axesCount: number) {
  return useState<DimensionMapping>([
    ...new Array(dims.length - axesCount).fill(0),
    ...['y', 'x'].slice(-axesCount),
  ]);
}
