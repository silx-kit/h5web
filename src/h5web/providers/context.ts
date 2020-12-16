import { createContext } from 'react';
import type { Dataset, Metadata } from './models';
import type { HDF5Id, HDF5Value } from './hdf5-models';

export abstract class ProviderAPI {
  abstract domain: string;
  abstract getMetadata(): Promise<Metadata>;
  abstract getValue(id: HDF5Id): Promise<HDF5Value>;
}

export const ProviderContext = createContext<{
  domain: string;
  metadata: Metadata;
  getValue: ProviderAPI['getValue'];
  getValues: (datasets: Dataset[]) => Promise<Record<string, HDF5Value>>;
}>({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
