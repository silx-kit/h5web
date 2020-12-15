import { createContext } from 'react';
import type { Metadata } from './models';
import type { HDF5Id, HDF5Value } from './hdf5-models';

export abstract class ProviderAPI {
  abstract domain: string;
  abstract getMetadata(): Promise<Metadata>;
  abstract getValue(id: HDF5Id): Promise<HDF5Value | undefined>;
}

export const ProviderContext = createContext<{
  domain: string;
  metadata: Metadata;
  getValue: ProviderAPI['getValue'];
  getValues: (ids: HDF5Id[]) => Promise<Record<HDF5Id, HDF5Value | undefined>>;
}>({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
