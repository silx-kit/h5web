import { createMemo } from '@h5web/shared/createMemo';
import {
  type AnyNumArray,
  type Domain,
  type IgnoreValue,
  ScaleType,
} from '@h5web/shared/vis-models';
import { getBounds, getValidDomainForScale } from '@h5web/shared/vis-utils';
import { useRerender, useSyncedRef } from '@react-hookz/web';
import { type Camera, useFrame, useThree } from '@react-three/fiber';
import {
  type RefCallback,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type BufferAttribute } from 'three';

import type H5WebGeometry from './shared/h5webGeometry';
import {
  getAxisDomain,
  getCombinedDomain,
  getValueToIndexScale,
} from './utils';

const useBounds = createMemo(getBounds);
export const useValidDomainForScale = createMemo(getValidDomainForScale);

export const useCombinedDomain = createMemo(getCombinedDomain);
export const useValueToIndexScale = createMemo(getValueToIndexScale);
export const useAxisDomain = createMemo(getAxisDomain);

export function useDomain(
  valuesArray: AnyNumArray,
  scaleType: ScaleType = ScaleType.Linear,
  errorArray?: AnyNumArray,
  ignoreValue?: IgnoreValue,
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
    (elem) => setStyles(elem ? globalThis.getComputedStyle(elem) : undefined),
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
  params: Params,
  config: {
    skipUpdates?: boolean; // set to `true` when R3F object is hidden
    isInteractive?: boolean; // set to `true` to keep bounding sphere up to date for raycaster
  } = {},
): H5WebGeometry<AttributeNames, Params> {
  const { skipUpdates = false, isInteractive = false } = config;

  const geometry = useMemo(() => new Ctor(dataLength), [Ctor, dataLength]);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(
    () => {
      if (skipUpdates) {
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
        attr.needsUpdate = true; // eslint-disable-line no-param-reassign
      });

      if (geometry.index) {
        geometry.index.needsUpdate = true;
      }

      invalidate();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      geometry,
      dataLength,
      ...Object.values(params), // eslint-disable-line react-hooks/exhaustive-deps
      skipUpdates,
      isInteractive,
      invalidate,
    ],
  );

  return geometry;
}
