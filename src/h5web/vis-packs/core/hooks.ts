import type { NdArray } from 'ndarray';
import { RefCallback, useCallback, useContext, useMemo, useState } from 'react';
import { useEventListener } from '@react-hookz/web';
import { createMemo } from 'react-use';
import { useFrame, useThree } from '@react-three/fiber';
import type { DimensionMapping } from '../../dimension-mapper/models';
import {
  applyMapping,
  getBaseArray,
  getBounds,
  getCombinedDomain,
  getSliceSelection,
  getValidDomainForScale,
  getValueToIndexScale,
} from './utils';
import { ScaleType, Size } from './models';
import { ProviderContext } from '../../providers/context';
import { isDefined } from '../../guards';
import type { Dataset, Value } from '../../providers/models';
import { isAxis } from '../../dimension-mapper/utils';

export function usePrefetchValues(
  datasets: (Dataset | undefined)[],
  dimMapping?: DimensionMapping
): void {
  const { valuesStore } = useContext(ProviderContext);
  datasets.filter(isDefined).forEach(({ path }) => {
    valuesStore.prefetch({ path, selection: getSliceSelection(dimMapping) });
  });
}

export function useDatasetValue<D extends Dataset>(
  dataset: D,
  dimMapping?: DimensionMapping
): Value<D>;

export function useDatasetValue<D extends Dataset>(
  dataset: D | undefined,
  dimMapping?: DimensionMapping
): Value<D> | undefined;

export function useDatasetValue(
  dataset: Dataset | undefined,
  dimMapping?: DimensionMapping
): unknown {
  const { valuesStore } = useContext(ProviderContext);

  if (!dataset) {
    return undefined;
  }

  // If `dimMapping` is not provided or has no slicing dimension, the entire dataset will be fetched
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
  valuesArray: NdArray<number[]> | number[],
  scaleType: ScaleType = ScaleType.Linear,
  errorArray?: NdArray<number[]> | number[]
) {
  const bounds = useBounds(valuesArray, errorArray);
  return useValidDomainForScale(bounds, scaleType);
}

export function useDomains(
  valuesArrays: (NdArray<number[]> | number[])[],
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

export function useVisSize(ratioToRespect: number | undefined): Size {
  const { width, height } = useThree((state) => state.size);

  if (!ratioToRespect) {
    return { width, height };
  }

  const canvasRatio = width / height;

  return {
    width: canvasRatio > ratioToRespect ? height * ratioToRespect : width,
    height: canvasRatio < ratioToRespect ? width / ratioToRespect : height,
  };
}

function onWheel(evt: WheelEvent) {
  evt.preventDefault();
}

export function useWheelCapture() {
  const { domElement } = useThree((state) => state.gl);

  // Handler must be registed as non-passive for `preventDefault` to have an effect
  // (React's `onWheel` prop registers handlers as passive)
  useEventListener(domElement, 'wheel', onWheel, { passive: false });
}

export const useCombinedDomain = createMemo(getCombinedDomain);

const useBaseArray = createMemo(getBaseArray);
const useApplyMapping = createMemo(applyMapping);

export function useMappedArray<T extends unknown[] | undefined>(
  value: T,
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
): T extends (infer U)[]
  ? [NdArray<U[]>, NdArray<U[]>]
  : [undefined, undefined];

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
  const baseArrays = useMemo(
    () => values.map((v) => getBaseArray(v, dims)),
    [dims, values]
  );
  const mappedArrays = useMemo(
    () => baseArrays.map((v) => applyMapping(v, mapping)),
    [baseArrays, mapping]
  );

  return [mappedArrays, autoScale ? mappedArrays : baseArrays];
}

export const useValueToIndexScale = createMemo(getValueToIndexScale);

export function useCSSCustomProperties(...names: string[]): {
  colors: string[];
  refCallback: RefCallback<HTMLElement>;
} {
  const [styles, setStyles] = useState<CSSStyleDeclaration>();

  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const refCallback: RefCallback<HTMLElement> = useCallback(
    (elem) => setStyles(elem ? window.getComputedStyle(elem) : undefined),
    [setStyles]
  );

  return {
    colors: names.map((name) => {
      return styles ? styles.getPropertyValue(name).trim() : 'transparent';
    }),
    refCallback,
  };
}

export function useSlicedDimsAndMapping(
  dims: number[],
  dimMapping: DimensionMapping
): [number[], DimensionMapping] {
  return useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter(isAxis),
    ],
    [dimMapping, dims]
  );
}
