import { createMemo } from '@h5web/shared/createMemo';
import {
  type AnyNumArray,
  type Domain,
  ScaleType,
} from '@h5web/shared/vis-models';
import {
  getBounds,
  getBoundsWithErrors,
  getValidDomainForScale,
} from '@h5web/shared/vis-utils';
import { useMediaQuery, useRerender, useSyncedRef } from '@react-hookz/web';
import { type Camera, useFrame, useThree } from '@react-three/fiber';
import {
  type RefCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type BufferGeometry } from 'three';

import {
  type AxisConfig,
  type AxisScale,
  type GetDomainOpts,
  type H5WebGeometry,
} from './models';
import {
  createScale,
  getAxisDomain,
  getCombinedDomain,
  getValueToIndexScale,
} from './utils';

export const useBounds = createMemo(getBounds);
export const useBoundsWithErrors = createMemo(getBoundsWithErrors);
export const useValidDomainForScale = createMemo(getValidDomainForScale);

export const useCombinedDomain = createMemo(getCombinedDomain);
export const useValueToIndexScale = createMemo(getValueToIndexScale);
export const useAxisDomain = createMemo(getAxisDomain);

export function useDomain(
  values: AnyNumArray,
  opts: GetDomainOpts & { errors?: AnyNumArray } = {},
): Domain | undefined {
  const {
    errors,
    includeErrors = true,
    scaleType = ScaleType.Linear,
    ignoreValue,
  } = opts;

  // Memoize bounds separately so they are not recomputed when scale type changes
  const bounds = useMemo(() => {
    if (errors) {
      return getBoundsWithErrors(values, errors, ignoreValue);
    }

    const b = getBounds(values, ignoreValue);
    return [b, b];
  }, [values, errors, ignoreValue]);

  return useMemo(() => {
    const [boundsWithErrors, boundsWithoutErrors] = bounds;

    return getValidDomainForScale(
      includeErrors ? boundsWithErrors : boundsWithoutErrors,
      scaleType,
    );
  }, [bounds, scaleType, includeErrors]);
}

export function useDomains(
  valuesArrays: AnyNumArray[],
  opts: GetDomainOpts & { errorsArrays?: (AnyNumArray | undefined)[] } = {},
): (Domain | undefined)[] {
  const {
    errorsArrays,
    includeErrors = true,
    scaleType = ScaleType.Linear,
    ignoreValue,
  } = opts;

  // Memoize bounds separately so they are not recomputed when scale type changes
  const allBounds = useMemo(() => {
    if (errorsArrays) {
      return valuesArrays.map((arr, i) => {
        return getBoundsWithErrors(arr, errorsArrays[i], ignoreValue);
      });
    }

    return valuesArrays.map((arr) => {
      const b = getBounds(arr, ignoreValue);
      return [b, b];
    });
  }, [valuesArrays, errorsArrays, ignoreValue]);

  return useMemo(() => {
    return allBounds.map((bounds) => {
      const [boundsWithErrors, boundsWithoutErrors] = bounds;

      return getValidDomainForScale(
        includeErrors ? boundsWithErrors : boundsWithoutErrors,
        scaleType,
      );
    });
  }, [allBounds, includeErrors, scaleType]);
}

export function useCanvasAxisScale(
  config: AxisConfig,
  canvasSize: number,
): AxisScale {
  const {
    scaleType = ScaleType.Linear,
    visDomain,
    flip = false,
    nice = false,
  } = config;

  return useMemo(() => {
    return createScale(scaleType, {
      domain: visDomain,
      range: [-canvasSize / 2, canvasSize / 2],
      reverse: flip,
      nice,
    });
  }, [canvasSize, flip, nice, scaleType, visDomain]);
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
  const [elem, refCallback] = useState<HTMLElement | null>(null);
  useMediaQuery('(prefers-color-scheme: dark)');

  if (!elem) {
    // Return `transparent` colors on initial render
    return [colorProperties.map(() => 'transparent'), refCallback];
  }

  const styles = globalThis.getComputedStyle(elem);
  const colors = colorProperties.map((p) => styles.getPropertyValue(p).trim());

  return [colors, refCallback];
}

export function useUpdateGeometry(
  geometry: H5WebGeometry & BufferGeometry,
  config: {
    skipUpdates?: boolean; // set to `true` when R3F object is hidden
    isInteractive?: boolean; // set to `true` to keep bounding sphere up to date for raycaster
  } = {},
): void {
  const { skipUpdates = false, isInteractive = false } = config;
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    if (skipUpdates) {
      return;
    }

    geometry.update();

    if (isInteractive) {
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
    }

    Object.values(geometry.attributes).forEach((attr) => {
      attr.needsUpdate = true; // eslint-disable-line no-param-reassign
    });

    if (geometry.index) {
      geometry.index.needsUpdate = true; // eslint-disable-line no-param-reassign
    }

    invalidate();
  }, [geometry, skipUpdates, isInteractive, invalidate]);
}
