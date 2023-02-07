import {
  ScaleType,
  getBounds,
  getValidDomainForScale,
  createMemo,
} from '@h5web/shared';
import type { Domain, AnyNumArray } from '@h5web/shared';
import { useSyncedRef } from '@react-hookz/web';
import type { Camera } from '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useMemo, useState } from 'react';
import type { RefCallback } from 'react';

import {
  getAxisDomain,
  getAxisValues,
  getCombinedDomain,
  getValueToIndexScale,
} from './utils';

const useBounds = createMemo(getBounds);
export const useValidDomainForScale = createMemo(getValidDomainForScale);

export const useCombinedDomain = createMemo(getCombinedDomain);
export const useValueToIndexScale = createMemo(getValueToIndexScale);
export const useAxisDomain = createMemo(getAxisDomain);
export const useAxisValues = createMemo(getAxisValues);

export function useDomain(
  valuesArray: AnyNumArray,
  scaleType: ScaleType = ScaleType.Linear,
  errorArray?: AnyNumArray
): Domain | undefined {
  // Distinct memoized calls allows for bounds to not be recomputed when scale type changes
  const bounds = useBounds(valuesArray, errorArray);
  return useValidDomainForScale(bounds, scaleType);
}

export function useDomains(
  valuesArrays: AnyNumArray[],
  scaleType: ScaleType = ScaleType.Linear,
  errorsArrays?: (AnyNumArray | undefined)[]
): (Domain | undefined)[] {
  const allBounds = useMemo(() => {
    return valuesArrays.map((arr, i) => getBounds(arr, errorsArrays?.[i]));
  }, [valuesArrays, errorsArrays]);

  return useMemo(
    () => allBounds.map((bounds) => getValidDomainForScale(bounds, scaleType)),
    [allBounds, scaleType]
  );
}

export function useCameraState<T>(
  factory: (camera: Camera) => T,
  equalityFn?: (prev: T, next: T) => boolean
): T {
  const camera = useThree((state) => state.camera);

  const factoryRef = useSyncedRef(factory);
  const [state, setState] = useState(() => factoryRef.current(camera));

  useFrame(() => {
    const next = factoryRef.current(camera);
    if (!equalityFn || !equalityFn(state, next)) {
      setState(next);
    }
  });

  return state;
}

export function useCssColors(
  colorProperties: string[]
): [string[], RefCallback<HTMLElement>] {
  const [styles, setStyles] = useState<CSSStyleDeclaration>();

  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const refCallback: RefCallback<HTMLElement> = useCallback(
    (elem) => setStyles(elem ? window.getComputedStyle(elem) : undefined),
    []
  );

  if (!styles) {
    // Return `transparent` colors on initial render
    return [colorProperties.map(() => 'transparent'), refCallback];
  }

  const colors = colorProperties.map((p) => styles.getPropertyValue(p).trim());

  return [colors, refCallback];
}
