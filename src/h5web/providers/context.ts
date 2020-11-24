import { createContext } from 'react';
import type { HDF5Id, HDF5Value, HDF5Metadata } from './models';

export abstract class ProviderAPI {
  abstract domain: string;
  abstract async getMetadata(): Promise<HDF5Metadata>;
  abstract async getValue(id: HDF5Id): Promise<HDF5Value | undefined>;
}

export const ProviderContext = createContext<{
  domain: string;
  metadata: HDF5Metadata;
  getValue: ProviderAPI['getValue'];
  getValues: (ids: HDF5Id[]) => Promise<Record<HDF5Id, HDF5Value | undefined>>;
}>({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
