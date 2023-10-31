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
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { BufferAttribute } from 'three';

import type H5WebGeometry from './shared/h5webGeometry';
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

export function useGeometry<
  AttributeNames extends string,
  Params extends object,
>(
  Ctor: new (len: number) => H5WebGeometry<AttributeNames, Params>,
  dataLength: number,
  params: Params | false | undefined, // skip updates by passing `false` or `undefined`
  isInteractive = false, // keep bounding sphere up to date for raycaster
): H5WebGeometry<AttributeNames, Params> {
  const geometry = useMemo(() => new Ctor(dataLength), [Ctor, dataLength]);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    if (!params) {
      return;
    }

    geometry.prepare(params);

    for (let i = 0; i < dataLength; i += 1) {
      geometry.update(i);
    }

    if (isInteractive) {
      geometry.computeBoundingSphere(); // https://github.com/mrdoob/three.js/issues/1170#issuecomment-3617180
    }

    Object.values<BufferAttribute>(geometry.attributes).forEach((attr) => {
      attr.needsUpdate = true;
    });

    if (geometry.index) {
      geometry.index.needsUpdate = true;
    }

    invalidate();
  }, [geometry, ...Object.values(params || {}), invalidate]); // eslint-disable-line react-hooks/exhaustive-deps

  return geometry;
}
