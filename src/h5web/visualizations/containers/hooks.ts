import { useAsyncResource } from 'use-async-resource';
import { useContext } from 'react';
import type { HDF5Id, HDF5Value } from '../../providers/models';
import { ProviderContext } from '../../providers/context';

export function useDatasetValue(id: HDF5Id): HDF5Value | undefined {
  const { getValue } = useContext(ProviderContext);
  const [valueReader] = useAsyncResource(getValue, id);
  return valueReader();
}

export function useDatasetValues(
  datasetsIds: (HDF5Id | undefined)[]
): HDF5Value[] | undefined {
  const { getValues } = useContext(ProviderContext);
  const [valuesReader] = useAsyncResource(getValues, datasetsIds);

  return valuesReader();
}
