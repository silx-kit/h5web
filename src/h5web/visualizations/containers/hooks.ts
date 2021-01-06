import { useContext } from 'react';
import type { HDF5Id, HDF5Value } from '../../providers/hdf5-models';
import { ProviderContext } from '../../providers/context';
import type { Dataset } from '../../providers/models';

export function useDatasetValue(id: HDF5Id): HDF5Value {
  const { valuesStore } = useContext(ProviderContext);
  return valuesStore.get(id);
}

export function useDatasetValues(
  datasets: Dataset[]
): Record<string, HDF5Value> {
  const { valuesStore } = useContext(ProviderContext);

  // Start fetching values (but only those that are not already fetched or being fetched)
  datasets.forEach(({ id }) => valuesStore.prefetch(id));

  // Read values from store (but suspend if at least one of the values is still being fetched)
  return Object.fromEntries(
    datasets.map(({ id, name }) => [name, valuesStore.get(id)])
  );
}
