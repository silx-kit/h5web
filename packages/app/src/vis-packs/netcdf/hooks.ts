import { type IgnoreValue } from '@h5web/lib';
import { hasNumericType } from '@h5web/shared/guards';
import { type ArrayShape, type Dataset } from '@h5web/shared/hdf5-models';
import { useMemo } from 'react';

import { useDataContext } from '../../providers/DataProvider';
import { createIgnoreFillValue, getFillValue, getValidRange } from './utils';

/* Priority order: `valid_min` and/or `valid_max`, then `valid_range`, then `_FillValue`.
 * Note that `_FillValue` acts as an invalid upper or lower bound (if positive or negative respectively).
 * See NetCDF `valid_range` convention: https://docs.unidata.ucar.edu/netcdf-c/current/attribute_conventions.html */
export function useNcIgnoreValue(
  dataset: Dataset<ArrayShape>,
): IgnoreValue | undefined {
  const { attrValuesStore } = useDataContext();

  return useMemo(() => {
    if (!hasNumericType(dataset)) {
      return undefined;
    }

    const validRange = getValidRange(dataset, attrValuesStore);
    if (validRange) {
      const [validMin, validMax] = validRange;
      return (val) => val < validMin || val > validMax;
    }

    const fillValue = getFillValue(dataset, attrValuesStore);
    if (fillValue !== undefined) {
      return createIgnoreFillValue(fillValue, dataset.type);
    }

    return undefined;
  }, [dataset, attrValuesStore]);
}
