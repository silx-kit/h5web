import type ndarray from 'ndarray';
import { useContext, useEffect, useMemo, useState } from 'react';
import { isNumber } from 'lodash-es';
import { createMemo } from 'react-use';
import { useFrame, useThree } from '@react-three/fiber';
import type { DimensionMapping } from '../../dimension-mapper/models';
import {
  applyMapping,
  getBaseArray,
  getBounds,
  getCanvasScale,
  getCombinedDomain,
  getSliceSelection,
  getValidDomainForScale,
  getValueToIndexScale,
} from './utils';
import AxisSystemContext from './shared/AxisSystemContext';
import { AxisScale, ScaleType } from './models';
import { ProviderContext } from '../../providers/context';
import type { Dataset, NumberOrNaN, Value } from '../../providers/models';

export function useDatasetValue<D extends Dataset | undefined>(
  dataset: D,
  dimMapping?: DimensionMapping
): D extends Dataset ? Value<D> : undefined;

export function useDatasetValue(
  dataset: Dataset | undefined,
  dimMapping?: DimensionMapping
): unknown {
  const { valuesStore } = useContext(ProviderContext);

  if (!dataset) {
    return undefined;
  }

  // If no dim mapping is provided or dim mapping has no slicing dimension, fetch entire dataset
  if (!dimMapping || !dimMapping.some(isNumber)) {
    return valuesStore.get({ path: dataset.path });
  }

  return valuesStore.get({
    path: dataset.path,
    selection: getSliceSelection(dimMapping),
  });
}

export function useDatasetValues<D extends Dataset>(
  datasets: D[]
): Record<string, Value<D>>;

export function useDatasetValues(datasets: Dataset[]): Record<string, unknown> {
  const { valuesStore } = useContext(ProviderContext);

  return Object.fromEntries(
    datasets.map(({ name, path }) => [name, valuesStore.get({ path })])
  );
}

const useBounds = createMemo(getBounds);
const useValidDomainForScale = createMemo(getValidDomainForScale);

export function useDomain(
  valuesArray: ndarray<NumberOrNaN> | NumberOrNaN[],
  scaleType: ScaleType = ScaleType.Linear,
  errorArray?: ndarray<NumberOrNaN> | NumberOrNaN[]
) {
  const bounds = useBounds(valuesArray, errorArray);
  return useValidDomainForScale(bounds, scaleType);
}

export function useDomains(
  valuesArrays: (ndarray<NumberOrNaN> | NumberOrNaN[])[],
  scaleType: ScaleType = ScaleType.Linear
) {
  const allBounds = useMemo(() => {
    return valuesArrays.map((arr) => getBounds(arr));
  }, [valuesArrays]);

  return useMemo(
    () => allBounds.map((bounds) => getValidDomainForScale(bounds, scaleType)),
    [allBounds, scaleType]
  );
}

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
  const { width, height } = useThree((state) => state.size);

  return {
    abscissaScale: getCanvasScale(abscissaConfig, width),
    ordinateScale: getCanvasScale(ordinateConfig, height),
  };
}

export function useWheelCapture() {
  const { domElement } = useThree((state) => state.gl);

  useEffect(() => {
    function onWheel(evt: WheelEvent) {
      evt.preventDefault();
    }

    // Handler must be registed as non-passive for `preventDefault` to have an effect
    // (React's `onWheel` prop registers handlers as passive)
    domElement.addEventListener('wheel', onWheel, { passive: false });
    return () => domElement.removeEventListener('wheel', onWheel);
  });
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
  values: NumberOrNaN[][],
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

export const useValueToIndexScale = createMemo(getValueToIndexScale);
