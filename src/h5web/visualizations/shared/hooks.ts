import ndarray from 'ndarray';
import { useContext, useMemo, useState } from 'react';
import { isNumber } from 'lodash-es';
import { assign } from 'ndarray-ops';
import { createMemo } from 'react-use';
import { useFrame, useThree } from 'react-three-fiber';
import type { DimensionMapping } from '../../dimension-mapper/models';
import { getCanvasScale, getDomain } from './utils';
import AxisSystemContext from './AxisSystemContext';
import { AxisScale } from './models';

export function useBaseArray<T>(
  value: T[] | undefined,
  rawDims: number[]
): ndarray<T> | undefined {
  return useMemo(() => {
    return value && ndarray<T>(value.flat(Infinity) as T[], rawDims);
  }, [rawDims, value]);
}

export function useMappedArray<T>(
  baseArray: ndarray<T> | undefined,
  mapperState: DimensionMapping
): ndarray<T> | undefined {
  return useMemo(() => {
    if (!baseArray || !mapperState) {
      return baseArray;
    }

    const isXBeforeY =
      mapperState.includes('y') &&
      mapperState.indexOf('x') < mapperState.indexOf('y');

    const slicingState = mapperState.map((val) => (isNumber(val) ? val : null));
    const slicedView = baseArray.pick(...slicingState);
    const mappedView = isXBeforeY ? slicedView.transpose(1, 0) : slicedView;

    // Create ndarray from mapped view so `dataArray.data` only contains values relevant to vis
    const mappedArray = ndarray<T>([], mappedView.shape);
    assign(mappedArray, mappedView);

    return mappedArray;
  }, [mapperState, baseArray]);
}

export function useDataArrays<T>(
  value: T[],
  rawDims: number[],
  dimensionMapping: DimensionMapping
): { baseArray: ndarray<T>; mappedArray: ndarray<T> } {
  // useBaseArray and useMappedArray returns undefined if and only if value is undefined but TS cannot enforce this.
  // This hook makes the necessary assertions in the case value is defined
  const baseArray = useBaseArray(value, rawDims) as ndarray<T>;
  return {
    baseArray,
    mappedArray: useMappedArray(baseArray, dimensionMapping) as ndarray<T>,
  };
}

export const useDomain = createMemo(getDomain);

export function useFrameRendering(): void {
  const [, setNum] = useState(0);

  useFrame(() => {
    setNum(Math.random());
  });
}

export function useCanvasScales(): {
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
} {
  const { abscissaConfig, ordinateConfig } = useContext(AxisSystemContext);
  const { size } = useThree();
  const { width, height } = size;

  return {
    abscissaScale: getCanvasScale(abscissaConfig, width),
    ordinateScale: getCanvasScale(ordinateConfig, height),
  };
}
