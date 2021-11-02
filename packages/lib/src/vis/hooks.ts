import { ScaleType, getBounds, getValidDomainForScale } from '@h5web/shared';
import { useEventListener } from '@react-hookz/web';
import { useFrame, useThree } from '@react-three/fiber';
import type { NdArray } from 'ndarray';
import { useCallback, useMemo, useState } from 'react';
import type { RefCallback } from 'react';
import { createMemo } from 'react-use';

import type { Size } from './models';
import {
  getAxisDomain,
  getCombinedDomain,
  getValueToIndexScale,
} from './utils';

const useBounds = createMemo(getBounds);
const useValidDomainForScale = createMemo(getValidDomainForScale);
export const useAxisDomain = createMemo(getAxisDomain);

export function useDomain(
  valuesArray: NdArray<number[]> | number[],
  scaleType: ScaleType = ScaleType.Linear,
  errorArray?: NdArray<number[]> | number[]
) {
  const bounds = useBounds(valuesArray, errorArray);
  return useValidDomainForScale(bounds, scaleType);
}

export function useFrameRendering(): void {
  const [, setNum] = useState(0);

  useFrame(() => {
    setNum(Math.random());
  });
}

export function useDomains(
  valuesArrays: (NdArray<number[]> | number[])[],
  scaleType: ScaleType = ScaleType.Linear
) {
  const allBounds = useMemo(() => {
    return valuesArrays.map((arr) => getBounds(arr));
  }, [valuesArrays]);

  return useMemo(
    () => allBounds.map((bounds) => getValidDomainForScale(bounds, scaleType)),
    [allBounds, scaleType]
  );
}

export function useVisSize(ratioToRespect: number | undefined): Size {
  const { width, height } = useThree((state) => state.size);

  if (!ratioToRespect) {
    return { width, height };
  }

  const canvasRatio = width / height;

  return {
    width: canvasRatio > ratioToRespect ? height * ratioToRespect : width,
    height: canvasRatio < ratioToRespect ? width / ratioToRespect : height,
  };
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

export const useCombinedDomain = createMemo(getCombinedDomain);

export const useValueToIndexScale = createMemo(getValueToIndexScale);

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
