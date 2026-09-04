import { type IgnoreValue } from '@h5web/lib';
import { hasNumericType } from '@h5web/shared/guards';
import { type ArrayShape, type Dataset } from '@h5web/shared/hdf5-models';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useDataContext } from '../../providers/DataProvider';
import { createIgnoreFillValue, getFillValue, getValidRange } from './utils';

/* Priority order: `valid_min` and/or `valid_max`, then `valid_range`, then `_FillValue`.
 * Note that `_FillValue` acts as an invalid upper or lower bound (if positive or negative respectively).
 * See NetCDF `valid_range` convention: https://docs.unidata.ucar.edu/netcdf-c/current/attribute_conventions.html */
export function useNcIgnoreValue(
  dataset: Dataset<ArrayShape>,
): IgnoreValue | undefined {
  const dataContext = useDataContext();

  const { data: nxIgnoreValue } = useSuspenseQuery({
    queryKey: [dataContext.filepath, 'ncIgnoreValue', dataset.path],
    queryFn: async () => {
      if (!hasNumericType(dataset)) {
        return null;
      }

      const validRange = await getValidRange(dataset, dataContext);
      if (validRange) {
        const [validMin, validMax] = validRange;
        return (val) => val < validMin || val > validMax;
      }

      const fillValue = await getFillValue(dataset, dataContext);
      if (fillValue !== undefined) {
        return createIgnoreFillValue(fillValue, dataset.type);
      }

      return null;
    },
  });

  return nxIgnoreValue || undefined;
}
