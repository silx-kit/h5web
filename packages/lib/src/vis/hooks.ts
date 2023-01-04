import {
  ScaleType,
  getBounds,
  getValidDomainForScale,
  createMemo,
} from '@h5web/shared';
import type { Domain, AnyNumArray, MappedTuple } from '@h5web/shared';
import type { Camera } from '@react-three/fiber';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useCallback, useMemo, useState } from 'react';
import type { RefCallback } from 'react';
import type { Vector2, Vector3 } from 'three';

import { useVisCanvasContext } from './shared/VisCanvasProvider';
import type { VisCanvasContextValue } from './shared/VisCanvasProvider';
import {
  getAxisDomain,
  getAxisValues,
  getCombinedDomain,
  getValueToIndexScale,
  toArray,
  worldToHtml,
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
  factory: (camera: Camera, context: VisCanvasContextValue) => T,
  deps: unknown[]
): T {
  const camera = useThree((state) => state.camera);
  const context = useVisCanvasContext();

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

export function useCssColors(
  colorProperties: string[]
): [string[], RefCallback<HTMLElement>] {
  const [styles, setStyles] = useState<CSSStyleDeclaration>();

  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const refCallback: RefCallback<HTMLElement> = useCallback(
    (elem) => setStyles(elem ? window.getComputedStyle(elem) : undefined),
    [setStyles]
  );

  if (!styles) {
    // Return `transparent` colors on initial render
    return [colorProperties.map(() => 'transparent'), refCallback];
  }

  const colors = colorProperties.map((p) => styles.getPropertyValue(p).trim());

  return [colors, refCallback];
}

export function useHtmlCoords<T extends Vector3[]>(
  ...worldCoords: T
): MappedTuple<T, Vector2> {
  return useCameraState(
    (...args) =>
      worldCoords.map((pt) => worldToHtml(...args, pt)) as MappedTuple<
        T,
        Vector2
      >,
    worldCoords // eslint-disable-line react-hooks/exhaustive-deps
  );
}
