import { createContext } from 'react';
import type { Entity } from './models';
import type { HDF5Value } from './hdf5-models';
import type { FetchStore } from 'react-suspense-fetch';
import type { ObjectKeyStore } from './utils';

export interface GetValueParams {
  path: string;
  selection?: string;
}

export abstract class ProviderAPI {
  abstract domain: string;
  abstract getEntity(path: string): Promise<Entity>;
  abstract getValue(params: GetValueParams): Promise<HDF5Value>;
}

export const ProviderContext = createContext<{
  domain: string;
  entitiesStore: FetchStore<Entity, string>;
  valuesStore: ObjectKeyStore<HDF5Value, GetValueParams>;
}>({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
