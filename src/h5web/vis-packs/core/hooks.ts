import type ndarray from 'ndarray';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isNumber } from 'lodash-es';
import { createMemo } from 'react-use';
import { useFrame, useThree } from 'react-three-fiber';
import type { DimensionMapping } from '../../dimension-mapper/models';
import {
  applyMapping,
  getBaseArray,
  getCanvasScale,
  getCombinedDomain,
  getDomain,
} from './utils';
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

export function useWheelCapture() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elem = ref.current;

    function onWheel(evt: WheelEvent) {
      evt.preventDefault();
    }

    // Handler must be registed as non-passive for `preventDefault` to have an effect
    // (React's `onWheel` prop registers handlers as passive)
    elem?.addEventListener('wheel', onWheel, { passive: false });
    return () => elem?.removeEventListener('wheel', onWheel);
  });

  return ref;
}

export const useCombinedDomain = createMemo(getCombinedDomain);

const useBaseArray = createMemo(getBaseArray);
const useApplyMapping = createMemo(applyMapping);

export function useMappedArray<T extends unknown[] | undefined>(
  value: T,
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
): T extends (infer U)[] ? [ndarray<U>, ndarray<U>] : [undefined, undefined];

export function useMappedArray<T>(
  value: T[] | undefined,
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
) {
  const baseArray = useBaseArray(value, dims);
  const mappedArray = useApplyMapping(baseArray, mapping);

  return [mappedArray, autoScale ? mappedArray : baseArray];
}

export function useMappedArrays(
  values: number[][],
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
) {
  const baseArrays = useMemo(() => values.map((v) => getBaseArray(v, dims)), [
    dims,
    values,
  ]);
  const mappedArrays = useMemo(
    () => baseArrays.map((v) => applyMapping(v, mapping)),
    [baseArrays, mapping]
  );

  return [mappedArrays, autoScale ? mappedArrays : baseArrays];
}
