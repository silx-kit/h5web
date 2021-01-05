import { createContext } from 'react';
import type { Dataset, Metadata } from './models';
import type { HDF5Id, HDF5Value } from './hdf5-models';

export abstract class ProviderAPI {
  abstract domain: string;
  abstract fetchMetadata(): Promise<Metadata>;
  abstract fetchValue(id: HDF5Id): Promise<HDF5Value>;
}

export const ProviderContext = createContext<{
  domain: string;
  metadata: Metadata;
  values: Map<HDF5Id, HDF5Value>;
  fetchValue: ProviderAPI['fetchValue'];
  fetchValues: (datasets: Dataset[]) => Promise<HDF5Value[]>;
}>({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
