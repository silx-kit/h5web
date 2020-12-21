import { useAsyncResource } from 'use-async-resource';
import { useContext } from 'react';
import type { HDF5Id, HDF5Value } from '../../providers/hdf5-models';
import { ProviderContext } from '../../providers/context';
import type { Dataset } from '../../providers/models';

export function useDatasetValue(id: HDF5Id): HDF5Value {
  const { getValue } = useContext(ProviderContext);
  const [valueReader] = useAsyncResource(getValue, id);
  return valueReader();
}

export function useDatasetValues(
  datasets: Dataset[]
): Record<string, HDF5Value> {
  const { getValues } = useContext(ProviderContext);
  const [valuesReader] = useAsyncResource(getValues, datasets);

  return valuesReader();
}
