import { createContext } from 'react';
import type { HDF5Id, HDF5Value, HDF5Metadata } from './models';

export abstract class ProviderAPI {
  abstract domain: string;
  abstract async getMetadata(): Promise<HDF5Metadata>;
  abstract async getValue(id: HDF5Id): Promise<HDF5Value>;
}

export const ProviderContext = createContext<{
  domain: string;
  metadata: HDF5Metadata;
  getValue: ProviderAPI['getValue'];
}>({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
