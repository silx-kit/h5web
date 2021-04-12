import { createContext } from 'react';
import type { Entity } from './models';
import type { FetchStore } from 'react-suspense-fetch';
import type { ObjectKeyStore } from './utils';

export interface GetValueParams {
  path: string;
  selection?: string;
}

export abstract class ProviderAPI {
  abstract filepath: string;
  abstract getEntity(path: string): Promise<Entity>;
  abstract getValue(params: GetValueParams): Promise<unknown>;
}

export const ProviderContext = createContext<{
  filepath: string;
  entitiesStore: FetchStore<Entity, string>;
  valuesStore: ObjectKeyStore<unknown, GetValueParams>;
}>({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
