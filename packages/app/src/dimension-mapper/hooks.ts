import type { ArrayShape, Dataset } from '@h5web/shared/hdf5-models';
import { useState } from 'react';

import { useDataContext } from '..';
import { getSliceSelection } from '../vis-packs/core/utils';
import type { DimensionMapping } from './models';

export function useDimMappingState(dims: number[], axesCount: number) {
  return useState<DimensionMapping>([
    ...Array.from({ length: dims.length - axesCount }, () => 0),
    ...['y' as const, 'x' as const].slice(-axesCount),
  ]);
}

export function useDimPrefetcher(
  dataset: Dataset<ArrayShape>,
  rawDims: number[],
  mapperState: DimensionMapping,
) {
  const { valuesStore } = useDataContext();

  return (index: number) => {
    const tempMapperState = [...mapperState];
    for (let i = 0; i < rawDims[index]; i += 1) {
      tempMapperState[index] = i;
      valuesStore.prefetch({
        dataset,
        selection: getSliceSelection(tempMapperState),
      });
    }
  };
}
