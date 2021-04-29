import { format } from 'd3-format';
import type ndarray from 'ndarray';
import { createMemo } from 'react-use';
import type { NumberOrNaN } from '../../../providers/models';
import { useValueToIndexScale } from '../hooks';
import type { TooltipIndexFormatter, TooltipValueFormatter } from '../models';
import { getVisDomain, getSafeDomain, getAxisValues } from './utils';

export const useVisDomain = createMemo(getVisDomain);
export const useSafeDomain = createMemo(getSafeDomain);
export const useAxisValues = createMemo(getAxisValues);

export function useTooltipFormatters(
  abscissas: number[],
  ordinates: number[],
  abscissaLabel: string | undefined,
  ordinateLabel: string | undefined,
  dataArray: ndarray<NumberOrNaN>
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

    formatValue: ([x, y]) => {
      const data = dataArray.get(ordinateToIndex(y), abscissaToIndex(x));
      return data !== null ? format('.3')(data) : 'NaN';
    },
  };
}
