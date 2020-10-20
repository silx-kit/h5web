import ndarray from 'ndarray';
import { useMemo, useState, useContext } from 'react';
import { isNumber } from 'lodash-es';
import { assign } from 'ndarray-ops';
import { createMemo } from 'react-use';
import { useFrame } from 'react-three-fiber';
import { useAsyncResource } from 'use-async-resource';
import type {
  HDF5Dataset,
  HDF5SimpleShape,
  HDF5Id,
  HDF5Value,
} from '../../providers/models';
import type { DimensionMapping } from '../../dataset-visualizer/models';
import { getDomain } from './utils';
import { ProviderContext } from '../../providers/context';

export function useDatasetValue(id: HDF5Id): HDF5Value | undefined {
  const { getValue } = useContext(ProviderContext);
  const [valueReader] = useAsyncResource(getValue, id);
  return valueReader();
}

export function useBaseArray<T>(dataset: HDF5Dataset, value: T[]): ndarray<T> {
  const rawDims = (dataset.shape as HDF5SimpleShape).dims;

  return useMemo(() => {
    return ndarray<T>(value.flat(Infinity) as T[], rawDims);
  }, [rawDims, value]);
}

export function useMappedArray<T>(
  baseArray: ndarray<T>,
  mapperState: DimensionMapping
): ndarray<T> {
  return useMemo(() => {
    if (mapperState === undefined) {
      return baseArray;
    }

    const isXBeforeY =
      mapperState.includes('y') &&
      mapperState.indexOf('x') < mapperState.indexOf('y');

    const slicingState = mapperState.map((val) => (isNumber(val) ? val : null));
    const slicedView = baseArray.pick(...slicingState);
    const mappedView = isXBeforeY ? slicedView.transpose(1, 0) : slicedView;

    // Create ndarray from mapped view so `dataArray.data` only contains values relevant to vis
    const mappedArray = ndarray<T>([], mappedView.shape);
    assign(mappedArray, mappedView);

    return mappedArray;
  }, [mapperState, baseArray]);
}

export const useDomain = createMemo(getDomain);

export function useFrameRendering(): void {
  const [, setNum] = useState();

  useFrame(() => {
    setNum(Math.random());
  });
}
