import { useDeferredValue, useState } from 'react';

import { useDataContext } from '..';
import type { DimensionMapping } from './models';

export function useDimMappingState(dims: number[], axesCount: number) {
  const { valuesStore } = useDataContext();

  const [dimMapping, setDimMapping] = useState<DimensionMapping>([
    ...Array.from({ length: dims.length - axesCount }, () => 0),
    ...['y' as const, 'x' as const].slice(-axesCount),
  ]);

  const deferredDimMapping = useDeferredValue(dimMapping);

  return {
    dimMapping: deferredDimMapping,
    isStale: deferredDimMapping !== dimMapping,
    setDimMapping: (newState: DimensionMapping) => {
      // valuesStore.cancelOngoing();
      // valuesStore.evictCancelled();
      setDimMapping(newState);
    },
  };
}
