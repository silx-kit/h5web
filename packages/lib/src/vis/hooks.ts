import type { AnyNumArray, Domain } from '@h5web/shared';
import {
  createMemo,
  getBounds,
  getValidDomainForScale,
  ScaleType,
} from '@h5web/shared';
import { useRerender, useSyncedRef } from '@react-hookz/web';
import type { Camera } from '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import type { RefCallback } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

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
  errorArray?: AnyNumArray,
  ignoreValue?: (val: number) => boolean,
): Domain | undefined {
  // Distinct memoized calls allows for bounds to not be recomputed when scale type changes
  const bounds = useBounds(valuesArray, errorArray, ignoreValue);
  return useValidDomainForScale(bounds, scaleType);
}

export function useDomains(
  valuesArrays: AnyNumArray[],
  scaleType: ScaleType = ScaleType.Linear,
  errorsArrays?: (AnyNumArray | undefined)[],
): (Domain | undefined)[] {
  const allBounds = useMemo(() => {
    return valuesArrays.map((arr, i) => getBounds(arr, errorsArrays?.[i]));
  }, [valuesArrays, errorsArrays]);

  return useMemo(
    () => allBounds.map((bounds) => getValidDomainForScale(bounds, scaleType)),
    [allBounds, scaleType],
  );
}

export function useCameraState<T>(
  factory: (camera: Camera) => T,
  deps: unknown[],
  equalityFn = (prev: T, next: T) => Object.is(prev, next),
): T {
  const camera = useThree((state) => state.camera);
  const rerender = useRerender();

  const stateRef = useRef<T>(); // ref instead of state to avoid re-render when deps change
  const factoryRef = useSyncedRef(factory); // ensure `useMemo` always sees latest `factory` reference

  useMemo(() => {
    // Compute state synchronously when deps change
    stateRef.current = factoryRef.current(camera);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    // Recompute state and re-render on every frame
    const next = factoryRef.current(camera);

    // ... unless state hasn't changed
    if (equalityFn(stateRef.current as T, next)) {
      return;
    }

    stateRef.current = next;
    rerender();
  });

  return stateRef.current as T; // synchronous update in `useMemo` guarantees `T` (which can include `undefined`)
}

export function useCssColors(
  colorProperties: string[],
): [string[], RefCallback<HTMLElement>] {
  const [styles, setStyles] = useState<CSSStyleDeclaration>();

  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const refCallback: RefCallback<HTMLElement> = useCallback(
    (elem) => setStyles(elem ? window.getComputedStyle(elem) : undefined),
    [],
  );

  if (!styles) {
    // Return `transparent` colors on initial render
    return [colorProperties.map(() => 'transparent'), refCallback];
  }

  const colors = colorProperties.map((p) => styles.getPropertyValue(p).trim());

  return [colors, refCallback];
}
