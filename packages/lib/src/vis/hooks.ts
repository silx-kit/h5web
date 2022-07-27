import { ScaleType, getBounds, getValidDomainForScale } from '@h5web/shared';
import type { Domain, AnyNumArray } from '@h5web/shared';
import { useMediaQuery } from '@react-hookz/web';
import type { Camera } from '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useCallback, useMemo, useState } from 'react';
import type { RefCallback } from 'react';
import { createMemo } from 'react-use';

import type { CustomColor } from './models';
import { useAxisSystemContext } from './shared/AxisSystemProvider';
import type { AxisSystemContextValue } from './shared/AxisSystemProvider';
import {
  getAxisDomain,
  getAxisValues,
  getCombinedDomain,
  getValueToIndexScale,
  toArray,
} from './utils';

const useBounds = createMemo(getBounds);
export const useValidDomainForScale = createMemo(getValidDomainForScale);

export const useCombinedDomain = createMemo(getCombinedDomain);
export const useValueToIndexScale = createMemo(getValueToIndexScale);
export const useAxisDomain = createMemo(getAxisDomain);
export const useAxisValues = createMemo(getAxisValues);

export const useToArray = createMemo(toArray);

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
  factory: (camera: Camera, context: AxisSystemContextValue) => T,
  deps: unknown[]
): T {
  const camera = useThree((state) => state.camera);
  const context = useAxisSystemContext();

  const [state, setState] = useState(() => factory(camera, context));

  function updateState() {
    setState(() => factory(camera, context)); // functional update to skip re-renders if state hasn't changed
  }

  // Update state when context value or dependencies change
  useEffect(updateState, [camera, context, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update state when canvas is redrawn (i.e. on zoom/pan)
  useFrame(updateState);

  return state;
}

export function useCustomColors(
  colorDefs: CustomColor[]
): [string[], RefCallback<HTMLElement>] {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [styles, setStyles] = useState<CSSStyleDeclaration>();

  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const refCallback: RefCallback<HTMLElement> = useCallback(
    (elem) => setStyles(elem ? window.getComputedStyle(elem) : undefined),
    [setStyles]
  );

  if (!styles) {
    // Return `transparent` colors on initial render
    return [colorDefs.map(() => 'transparent'), refCallback];
  }

  const colors = colorDefs.map(({ property, fallback, darkFallback }) => {
    return (
      styles.getPropertyValue(property).trim() ||
      (isDark && darkFallback ? darkFallback : fallback)
    );
  });

  return [colors, refCallback];
}
