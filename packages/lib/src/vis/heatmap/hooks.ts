import { createMemo } from '@h5web/shared';

import {
  getVisDomain,
  getSafeDomain,
  getPixelEdgeValues,
  toTextureSafeNdArray,
} from './utils';

export const useVisDomain = createMemo(getVisDomain);
export const useSafeDomain = createMemo(getSafeDomain);
export const usePixelEdgeValues = createMemo(getPixelEdgeValues);
export const useTextureSafeNdArray = createMemo(toTextureSafeNdArray);
