import { createContext } from 'react';
import type { Entity } from './models';
import type { FetchStore } from 'react-suspense-fetch';
import type { ObjectKeyStore } from './utils';

// https://github.com/microsoft/TypeScript/issues/15300#issuecomment-771916993
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GetValueParams = {
  path: string;
  selection?: string;
};

export abstract class ProviderAPI {
  abstract filepath: string;
  abstract getEntity(path: string): Promise<Entity>;
  abstract getValue(params: GetValueParams): Promise<unknown>;
}

interface Context {
  filepath: string;
  entitiesStore: FetchStore<Entity, string>;
  valuesStore: ObjectKeyStore<GetValueParams>;
}

export const ProviderContext = createContext<Context>({} as Context);
