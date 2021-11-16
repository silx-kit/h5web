import type { AttributeValues, Entity } from '@h5web/shared';
import { createContext } from 'react';
import type { FetchStore } from 'react-suspense-fetch';

import type { ImageAttribute } from '../vis-packs/core/models';
import type { NxAttribute } from '../vis-packs/nexus/models';
import type { ValuesStoreParams } from './models';

interface ValuesStore extends FetchStore<unknown, ValuesStoreParams> {
  cancelOngoing: () => void;
  evictCancelled: () => void;
}

export interface AttrValuesStore extends FetchStore<AttributeValues, Entity> {
  getSingle: (
    entity: Entity,
    attrName: NxAttribute | ImageAttribute
  ) => unknown | undefined;
}

interface Context {
  filepath: string;
  filename: string;
  entitiesStore: FetchStore<Entity, string>;
  valuesStore: ValuesStore;
  attrValuesStore: AttrValuesStore;
}

export const ProviderContext = createContext({} as Context);
