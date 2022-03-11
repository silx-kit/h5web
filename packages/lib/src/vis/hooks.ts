import { ScaleType, getBounds, getValidDomainForScale } from '@h5web/shared';
import type { Domain, AnyNumArray } from '@h5web/shared';
import { useEventListener, useMediaQuery } from '@react-hookz/web';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useMemo, useState } from 'react';
import type { RefCallback } from 'react';
import { createMemo } from 'react-use';

import { useAxisSystemContext } from './shared/AxisSystemContext';
import {
  getCameraFOV,
  getAxisDomain,
  getCombinedDomain,
  getValueToIndexScale,
} from './utils';

const useBounds = createMemo(getBounds);
const useValidDomainForScale = createMemo(getValidDomainForScale);

export const useCombinedDomain = createMemo(getCombinedDomain);
export const useValueToIndexScale = createMemo(getValueToIndexScale);
export const useAxisDomain = createMemo(getAxisDomain);

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
  scaleType: ScaleType = ScaleType.Linear
): (Domain | undefined)[] {
  const allBounds = useMemo(() => {
    return valuesArrays.map((arr) => getBounds(arr));
  }, [valuesArrays]);

  return useMemo(
    () => allBounds.map((bounds) => getValidDomainForScale(bounds, scaleType)),
    [allBounds, scaleType]
  );
}

export function useVisibleDomains(): {
  xVisibleDomain: Domain;
  yVisibleDomain: Domain;
} {
  const { worldToData } = useAxisSystemContext();
  const camera = useThree((state) => state.camera);

  const { topRight, bottomLeft } = getCameraFOV(camera);

  const dataBottomLeft = worldToData(bottomLeft);
  const dataTopRight = worldToData(topRight);

  return {
    xVisibleDomain: [dataBottomLeft.x, dataTopRight.x],
    yVisibleDomain: [dataBottomLeft.y, dataTopRight.y],
  };
}

export function useFrameRendering(): void {
  const [, setNum] = useState(0);

  useFrame(() => {
    setNum(Math.random());
  });
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

export function useCustomColors(
  properties: Record<`--h5w-${string}`, string | string[]>
): [string[], RefCallback<HTMLElement>] {
  const [styles, setStyles] = useState<CSSStyleDeclaration>();
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');

  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const refCallback: RefCallback<HTMLElement> = useCallback(
    (elem) => setStyles(elem ? window.getComputedStyle(elem) : undefined),
    [setStyles]
  );

  if (!styles) {
    // Return `transparent` colors on initial render
    return [Object.keys(properties).map(() => 'transparent'), refCallback];
  }

  const colors = Object.entries(properties).map(([name, defaultColors]) => {
    const [light, dark] = Array.isArray(defaultColors)
      ? defaultColors
      : [defaultColors, defaultColors];

    return styles.getPropertyValue(name).trim() || (isDark ? dark : light);
  });

  return [colors, refCallback];
}
