import { type IgnoreValue } from '@h5web/lib';
import { createMemo } from '@h5web/shared/createMemo';
import { hasArrayShape, hasNumericType } from '@h5web/shared/guards';
import { type Dataset } from '@h5web/shared/hdf5-models';
import { useSuspenseQueries } from '@tanstack/react-query';

import {
  type DataContextValue,
  useDataContext,
} from '../../providers/DataProvider';
import {
  getIsInvalid,
  getPacking,
  type Packing,
  unpackArray,
  unpackNumArray,
} from './utils';

export const useUnpackedArray = createMemo(unpackArray);
export const useUnpackedNumArray = createMemo(unpackNumArray);

function packingQuery(
  dataset: Dataset | undefined,
  dataContext: DataContextValue,
) {
  return {
    queryKey: [dataContext.filepath, 'packing', dataset?.path],
    queryFn: async (): Promise<Packing | null> => {
      return (dataset && (await getPacking(dataset, dataContext))) || null;
    },
  };
}

function ignoreValueQuery(
  dataset: Dataset | undefined,
  dataContext: DataContextValue,
) {
  return {
    queryKey: [dataContext.filepath, 'ignoreValue', dataset?.path],
    queryFn: async (): Promise<IgnoreValue | null> => {
      if (!dataset || !hasArrayShape(dataset) || !hasNumericType(dataset)) {
        return null;
      }

      // Invalid packed values are already replaced with `NaN` when unpacking
      if (await getPacking(dataset, dataContext)) {
        return null;
      }

      return (await getIsInvalid(dataset, dataContext)) || null;
    },
  };
}

export function usePackings(
  datasets: (Dataset | undefined)[],
): (Packing | undefined)[] {
  const dataContext = useDataContext();

  const results = useSuspenseQueries({
    queries: datasets.map((dataset) => packingQuery(dataset, dataContext)),
  });

  return results.map(({ data }) => data ?? undefined);
}

export function usePacking(dataset: Dataset): Packing | undefined {
  return usePackings([dataset])[0];
}

export function useIgnoreValues(
  datasets: (Dataset | undefined)[],
): (IgnoreValue | undefined)[] {
  const dataContext = useDataContext();

  const results = useSuspenseQueries({
    queries: datasets.map((dataset) => ignoreValueQuery(dataset, dataContext)),
  });

  return results.map(({ data }) => data ?? undefined);
}

export function useIgnoreValue(dataset: Dataset): IgnoreValue | undefined {
  return useIgnoreValues([dataset])[0];
}
