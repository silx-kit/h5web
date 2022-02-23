import { ScaleType, getBounds, getValidDomainForScale } from '@h5web/shared';
import type { Domain, AnyNumArray } from '@h5web/shared';
import { useEventListener } from '@react-hookz/web';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useMemo, useState } from 'react';
import type { RefCallback } from 'react';
import { createMemo } from 'react-use';

import { useAxisSystemContext } from './shared/AxisSystemContext';
import {
  CAMERA_BOTTOM_LEFT,
  CAMERA_TOP_RIGHT,
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

  const worldBottomLeft = CAMERA_BOTTOM_LEFT.clone().unproject(camera);
  const worldTopRight = CAMERA_TOP_RIGHT.clone().unproject(camera);

  const dataBottomLeft = worldToData(worldBottomLeft);
  const dataTopRight = worldToData(worldTopRight);

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
