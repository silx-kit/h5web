import { createContext } from 'react';
import type { Metadata } from './models';
import type { HDF5Id, HDF5Value } from './hdf5-models';
import type { FetchStore } from 'react-suspense-fetch';

export abstract class ProviderAPI {
  abstract domain: string;
  abstract fetchMetadata(): Promise<Metadata>;
  abstract fetchValue(id: HDF5Id): Promise<HDF5Value>;
}

export const ProviderContext = createContext<{
  domain: string;
  metadata: Metadata;
  valuesStore: FetchStore<HDF5Value, HDF5Id>;
}>({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
