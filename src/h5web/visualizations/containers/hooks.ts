import { useAsyncResource } from 'use-async-resource';
import { useContext } from 'react';
import type { HDF5Id, HDF5Value } from '../../providers/hdf5-models';
import { ProviderContext } from '../../providers/context';
import type { Dataset } from '../../providers/models';

export function useDatasetValue(id: HDF5Id): HDF5Value {
  const { values, fetchValue } = useContext(ProviderContext);
  const [valueReader] = useAsyncResource(fetchValue, id);

  if (!values.has(id)) {
    values.set(id, valueReader());
  }

  return values.get(id);
}

export function useDatasetValues(
  datasets: Dataset[]
): Record<string, HDF5Value> {
  const { values, fetchValues } = useContext(ProviderContext);
  const [valuesReader] = useAsyncResource(fetchValues, datasets);

  if (datasets.some(({ id }) => !values.has(id))) {
    valuesReader().forEach((val, i) => {
      values.set(datasets[i].id, val);
    });
  }

  return Object.fromEntries(
    datasets.map(({ id, name }) => [name, values.get(id)])
  );
}
