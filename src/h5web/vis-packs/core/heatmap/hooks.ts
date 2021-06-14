import { useThree } from '@react-three/fiber';
import { format } from 'd3-format';
import type { NdArray } from 'ndarray';
import { createMemo } from 'react-use';
import { useValueToIndexScale } from '../hooks';
import type {
  Domain,
  Size,
  TooltipIndexFormatter,
  TooltipValueFormatter,
} from '../models';
import { extendDomain } from '../utils';
import { getVisDomain, getSafeDomain, getAxisValues } from './utils';

export const useVisDomain = createMemo(getVisDomain);
export const useSafeDomain = createMemo(getSafeDomain);
export const useAxisValues = createMemo(getAxisValues);

export function useTooltipFormatters(
  abscissas: number[],
  ordinates: number[],
  abscissaLabel: string | undefined,
  ordinateLabel: string | undefined,
  dataArray: NdArray
): {
  formatIndex: TooltipIndexFormatter;
  formatValue: TooltipValueFormatter;
} {
  const abscissaToIndex = useValueToIndexScale(abscissas);
  const ordinateToIndex = useValueToIndexScale(ordinates);

  return {
    formatIndex: ([x, y]) =>
      `${abscissaLabel || 'x'}=${abscissas[abscissaToIndex(x)]}, ` +
      `${ordinateLabel || 'y'}=${ordinates[ordinateToIndex(y)]}`,

    formatValue: ([x, y]) =>
      format('.3')(dataArray.get(ordinateToIndex(y), abscissaToIndex(x))),
  };
}

export function useImageSize(imageRatio: number | undefined): Size {
  const { width, height } = useThree((state) => state.size);

  if (!imageRatio) {
    return { width, height };
  }

  const canvasRatio = width / height;
  const mismatch = canvasRatio / imageRatio;

  return {
    width: mismatch > 1 ? height * imageRatio : width,
    height: mismatch > 1 ? height : width / imageRatio,
  };
}

export function useCanvasDomains(
  imageSize: Size,
  abscissaDomain: Domain,
  ordinateDomain: Domain
): [Domain, Domain] {
  const canvasSize = useThree((state) => state.size);

  const widthRatio = canvasSize.width / imageSize.width;
  const heightRatio = canvasSize.height / imageSize.height;

  // `extendDomain(domain, factor)` actually extends  `domain` by `(1 + 2 * factor)`
  return [
    extendDomain(abscissaDomain, (widthRatio - 1) / 2),
    extendDomain(ordinateDomain, (heightRatio - 1) / 2),
  ];
}
