import ndarray from 'ndarray';
import { useMemo, useState } from 'react';
import { isNumber } from 'lodash-es';
import { assign } from 'ndarray-ops';
import { createMemo } from 'react-use';
import { useFrame } from 'react-three-fiber';
import type { DimensionMapping } from '../../dataset-visualizer/models';
import { findDomain, getSupportedDomain } from './utils';

export function useBaseArray<T>(value: T[], rawDims: number[]): ndarray<T> {
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

export const useDataDomain = createMemo(findDomain);

export const useSupportedDomain = createMemo(getSupportedDomain);

export function useFrameRendering(): void {
  const [, setNum] = useState();

  useFrame(() => {
    setNum(Math.random());
  });
}
