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
import { useMediaQuery, useSyncedRef } from '@react-hookz/web';
import { type Camera, useFrame, useThree } from '@react-three/fiber';
import { type RefCallback, useLayoutEffect, useMemo, useState } from 'react';
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
  isEqual: (prev: T, next: T) => boolean = Object.is,
): T {
  const camera = useThree((state) => state.camera);

  const factoryRef = useSyncedRef(factory);
  const isEqualRef = useSyncedRef(isEqual);

  /* Baseline value computed synchronously whenever `deps` (or the camera) change.
   * Wrapped in an object so each recomputation has a unique identity. */
  const baseline = useMemo(
    () => ({ value: factory(camera) }),
    [camera, ...deps], // eslint-disable-line @eslint-react/exhaustive-deps
  );

  // Latest value from the frame loop, tagged with the baseline it was computed under
  const [live, setLive] = useState({ baseline, value: baseline.value });

  /* A live value is only valid for the baseline it was tagged with.
   * If deps changed since, it's stale, so fall back to the new baseline. */
  const value = live.baseline === baseline ? live.value : baseline.value;

  useFrame(() => {
    const next = factoryRef.current(camera);
    if (isEqualRef.current(value, next)) {
      return;
    }

    setLive({ baseline, value: next });
  });

  return value;
}

export function useCssColors(
  colorProperties: string[],
): [string[], RefCallback<HTMLElement>] {
  const [elem, refCallback] = useState<HTMLElement | null>(null);

  /* Re-render when color scheme changes to read the CSS color values again (see below).
   * Note that a consumer app may change the specified CSS properties dynamically, and there's
   * no easy and efficient way to detect these changes. In the worst case, color changes are
   * applied the next time the visualization re-renders for any other reason. */
  useMediaQuery('(prefers-color-scheme: dark)');

  if (!elem) {
    // Return `transparent` colors on initial render
    return [colorProperties.map(() => 'transparent'), refCallback];
  }

  // Read CSS color values during render
  const styles = globalThis.getComputedStyle(elem); // eslint-disable-line @eslint-react/purity
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
