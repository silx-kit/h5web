import type ndarray from 'ndarray';
import { useMemo } from 'react';
import { ScaleType, Domain } from '../shared/models';
import { findDomain, extendDomain } from '../shared/utils';

export function useAxisDomain(
  dataArray: ndarray,
  scaleType: ScaleType
): Domain | undefined {
  return useMemo(() => {
    const isLogScale = scaleType === ScaleType.Log;
    const rawDomain = isLogScale
      ? findDomain((dataArray.data as number[]).filter((x) => x > 0))
      : findDomain(dataArray.data as number[]);

    return rawDomain && extendDomain(rawDomain, 0.05, isLogScale);
  }, [dataArray.data, scaleType]);
}
