import type { Entity } from '@h5web/shared';
import { assertGroupWithChildren, isGroup } from '@h5web/shared';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { createFetchStore } from 'react-suspense-fetch';

import { hasAttribute } from '../utils';
import type { ImageAttribute } from '../vis-packs/core/models';
import type { NxAttribute } from '../vis-packs/nexus/models';
import type { DataProviderApi } from './api';
import type {
  AttrValuesStore,
  EntitiesStore,
  ProgressCallback,
  ValuesStore,
} from './models';
import { getNameFromPath } from './utils';

export interface DataContextValue {
  filepath: string;
  filename: string;
  entitiesStore: EntitiesStore;
  valuesStore: ValuesStore;
  attrValuesStore: AttrValuesStore;

  // Undocumented
  getExportURL?: DataProviderApi['getExportURL'];
  addProgressListener: (cb: ProgressCallback) => void;
  removeProgressListener: (cb: ProgressCallback) => void;
}

const DataContext = createContext({} as DataContextValue);

export function useDataContext() {
  return useContext(DataContext);
}

interface Props {
  api: DataProviderApi;
}

function DataProvider(props: PropsWithChildren<Props>) {
  const { api, children } = props;

  const entitiesStore = useMemo(() => {
    const childCache = new Map<string, Entity>();

    const store = createFetchStore(async (path: string) => {
      if (childCache.has(path)) {
        return childCache.get(path) as Entity;
      }

      const entity = await api.getEntity(path);

      if (isGroup(entity)) {
        // Make sure `getEntity` doesn't return groups without `children` proprety
        assertGroupWithChildren(entity);

        // Cache non-group children (datasets, datatypes and links)
        entity.children
          .filter((child) => !isGroup(child))
          .forEach((child) => {
            childCache.set(child.path, child);
          });
      }

      return entity;
    });

    store.prefetch('/'); // pre-fetch root group
    return store;
  }, [api]);

  const valuesStore = useMemo(() => {
    const store = createFetchStore(api.getValue.bind(api), {
      type: 'Map',
      areEqual: (a, b) =>
        a.dataset.path === b.dataset.path && a.selection === b.selection,
    });

    return Object.assign(store, {
      cancelOngoing: () => api.cancelValueRequests(),
      evictCancelled: () => {
        api.cancelledValueRequests.forEach(({ storeParams }) => {
          valuesStore.evict(storeParams);
        });
        api.cancelledValueRequests.clear();
      },
    });
  }, [api]);

  const attrValuesStore = useMemo(() => {
    const store = createFetchStore(api.getAttrValues.bind(api), {
      type: 'Map',
      areEqual: (a, b) => a.path === b.path,
    });

    return Object.assign(store, {
      getSingle: (entity: Entity, attrName: NxAttribute | ImageAttribute) => {
        return hasAttribute(entity, attrName)
          ? attrValuesStore.get(entity)[attrName]
          : undefined;
      },
    });
  }, [api]);

  return (
    <DataContext.Provider
      value={{
        filepath: api.filepath,
        filename: getNameFromPath(api.filepath),
        entitiesStore,
        valuesStore,
        attrValuesStore,
        getExportURL: api.getExportURL?.bind(api),
        addProgressListener: api.addProgressListener.bind(api),
        removeProgressListener: api.removeProgressListener.bind(api),
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default DataProvider;
