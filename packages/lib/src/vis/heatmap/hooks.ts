import type { NumArray } from '@h5web/shared';
import type { NdArray } from 'ndarray';
import { useMemo } from 'react';
import { createMemo } from 'react-use';

import type { TextureSafeTypedArray } from './models';
import {
  getVisDomain,
  getSafeDomain,
  getPixelEdgeValues,
  toTextureSafeNdArray,
} from './utils';

export const useVisDomain = createMemo(getVisDomain);
export const useSafeDomain = createMemo(getSafeDomain);
export const usePixelEdgeValues = createMemo(getPixelEdgeValues);

export function useTextureSafeNdArray(
  ndArr: NdArray<NumArray>
): NdArray<TextureSafeTypedArray>;

export function useTextureSafeNdArray(
  ndArr: NdArray<NumArray> | undefined
): NdArray<TextureSafeTypedArray> | undefined;

export function useTextureSafeNdArray(
  ndArr: NdArray<NumArray> | undefined
): NdArray<TextureSafeTypedArray> | undefined {
  return useMemo(() => {
    return ndArr && toTextureSafeNdArray(ndArr);
  }, [ndArr]);
}
