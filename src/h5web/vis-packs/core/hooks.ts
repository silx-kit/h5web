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
import type { HDF5Shape, HDF5Type } from '../../providers/hdf5-models';
import { ProviderContext } from '../../providers/context';
import type { Dataset, Value } from '../../providers/models';
import { isAxis } from '../../dimension-mapper/utils';

export function useDatasetValue<
  S extends HDF5Shape,
  T extends HDF5Type,
  D extends Dataset<S, T> | undefined
>(
  dataset: D,
  dimMapping?: DimensionMapping
): D extends Dataset<infer S, infer T> ? Value<S, T> : undefined;

export function useDatasetValue(
  dataset: Dataset | undefined,
  dimMapping?: DimensionMapping
) {
  const { valuesStore } = useContext(ProviderContext);

  if (!dataset) {
    return undefined;
  }

  // If no dim mapping is provided or dim mapping has no slicing dimension, fetch entire dataset
  if (!dimMapping || !dimMapping.some(isNumber)) {
    return valuesStore.get({ path: dataset.path });
  }

  // Create slice selection string from dim mapping - e.g. [0, 'y', 'x'] => "0,:,:"
  const selection = dimMapping
    .map((dim) => (isAxis(dim) ? ':' : dim))
    .join(',');

  return valuesStore.get({ path: dataset.path, selection });
}

export function useDatasetValues<S extends HDF5Shape, T extends HDF5Type>(
  datasets: Dataset<S, T>[]
) {
  const { valuesStore } = useContext(ProviderContext);

  return Object.fromEntries(
    datasets.map(({ name, path }) => [
      name,
      valuesStore.get({ path }) as Value<S, T>,
    ])
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
    if (!baseArray) {
      return undefined;
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
