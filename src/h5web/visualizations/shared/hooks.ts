import ndarray from 'ndarray';
import { useContext, useMemo, useState } from 'react';
import { isNumber } from 'lodash-es';
import { assign } from 'ndarray-ops';
import { createMemo } from 'react-use';
import { useFrame, useThree } from 'react-three-fiber';
import type { DimensionMapping } from '../../dimension-mapper/models';
import { getCanvasScale, getDomain } from './utils';
import AxisSystemContext from './AxisSystemContext';
import type { AxisScale } from './models';

export function useBaseArray<T>(value: T[], rawDims: number[]): ndarray<T>;
export function useBaseArray<T>(
  value: T[] | undefined,
  rawDims: number[]
): ndarray<T> | undefined;

export function useBaseArray<T>(
  value: T[] | undefined,
  rawDims: number[]
): ndarray<T> | undefined {
  return useMemo(() => {
    return value && ndarray<T>(value.flat(Infinity) as T[], rawDims);
  }, [rawDims, value]);
}

export function useMappedArray<T>(
  baseArray: ndarray<T>,
  mapping: DimensionMapping
): ndarray<T>;
export function useMappedArray<T>(
  baseArray: ndarray<T> | undefined,
  mapping: DimensionMapping
): ndarray<T> | undefined;

export function useMappedArray<T>(
  baseArray: ndarray<T> | undefined,
  mapping: DimensionMapping
): ndarray<T> | undefined {
  return useMemo(() => {
    if (!baseArray || !mapping) {
      return baseArray;
    }

    const isXBeforeY =
      mapping.includes('y') && mapping.indexOf('x') < mapping.indexOf('y');

    const slicingState = mapping.map((val) => (isNumber(val) ? val : null));
    const slicedView = baseArray.pick(...slicingState);
    const mappedView = isXBeforeY ? slicedView.transpose(1, 0) : slicedView;

    // Create ndarray from mapped view so `dataArray.data` only contains values relevant to vis
    const mappedArray = ndarray<T>([], mappedView.shape);
    assign(mappedArray, mappedView);

    return mappedArray;
  }, [mapping, baseArray]);
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
