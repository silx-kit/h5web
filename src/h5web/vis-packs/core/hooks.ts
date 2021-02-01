import ndarray from 'ndarray';
import { useContext, useMemo, useState } from 'react';
import { isNumber } from 'lodash-es';
import { assign } from 'ndarray-ops';
import { createMemo } from 'react-use';
import { useFrame, useThree } from 'react-three-fiber';
import type { DimensionMapping } from '../../dimension-mapper/models';
import { getCanvasScale, getDomain } from './utils';
import AxisSystemContext from './shared/AxisSystemContext';
import type { AxisScale } from './models';
import type { HDF5Value } from '../../providers/hdf5-models';
import { ProviderContext } from '../../providers/context';
import type { Dataset } from '../../providers/models';

export function useDatasetValue(
  path: string | undefined
): HDF5Value | undefined {
  const { valuesStore } = useContext(ProviderContext);
  return path !== undefined ? valuesStore.get(path) : undefined;
}

export function useDatasetValues(
  datasets: Dataset[]
): Record<string, HDF5Value> {
  const { valuesStore } = useContext(ProviderContext);

  return Object.fromEntries(
    datasets.map(({ name, path }) => [name, valuesStore.get(path)])
  );
}

export function useBaseArray<T extends unknown[] | undefined>(
  value: T,
  rawDims: number[]
): T extends (infer U)[] ? ndarray<U> : undefined;

export function useBaseArray<T>(
  value: T[] | undefined,
  rawDims: number[]
): ndarray<T> | undefined {
  return useMemo(() => {
    return value && ndarray<T>(value.flat(Infinity) as T[], rawDims);
  }, [rawDims, value]);
}

export function useMappedArray<T extends ndarray<unknown> | undefined>(
  baseArray: T,
  mapping: DimensionMapping
): T extends ndarray<infer U> ? ndarray<U> : undefined;

export function useMappedArray<T>(
  baseArray: ndarray<T> | undefined,
  mapping: DimensionMapping
): ndarray<T> | undefined {
  return useMemo(() => {
    if (!baseArray || !mapping) {
      return baseArray;
    }

    const isXBeforeY =
      mapping.includes('y') && mapping.indexOf('x') < mapping.indexOf('y');

    const slicingState = mapping.map((val) => (isNumber(val) ? val : null));
    const slicedView = baseArray.pick(...slicingState);
    const mappedView = isXBeforeY ? slicedView.transpose(1, 0) : slicedView;

    // Create ndarray from mapped view so `dataArray.data` only contains values relevant to vis
    const mappedArray = ndarray<T>([], mappedView.shape);
    assign(mappedArray, mappedView);

    return mappedArray;
  }, [mapping, baseArray]);
}

export const useDomain = createMemo(getDomain);

export function useFrameRendering(): void {
  const [, setNum] = useState(0);

  useFrame(() => {
    setNum(Math.random());
  });
}

export function useCanvasScales(): {
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
} {
  const { abscissaConfig, ordinateConfig } = useContext(AxisSystemContext);
  const { size } = useThree();
  const { width, height } = size;

  return {
    abscissaScale: getCanvasScale(abscissaConfig, width),
    ordinateScale: getCanvasScale(ordinateConfig, height),
  };
}
