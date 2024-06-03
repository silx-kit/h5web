import { isGroup } from '@h5web/shared/guards';
import type { ChildEntity, Entity, Group } from '@h5web/shared/hdf5-models';
import { getNameFromPath } from '@h5web/shared/hdf5-utils';
import { createFetchStore } from '@h5web/shared/react-suspense-fetch';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { hasAttribute } from '../utils';
import type { DataProviderApi } from './api';
import type {
  AttrName,
  AttrValuesStore,
  EntitiesStore,
  ProgressCallback,
  ValuesStore,
} from './models';

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
  getSearchablePaths?: DataProviderApi['getSearchablePaths'];
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
    const childCache = new Map<string, Exclude<ChildEntity, Group>>();

    const store = createFetchStore(async (path: string) => {
      const cachedEntity = childCache.get(path);
      if (cachedEntity) {
        return cachedEntity;
      }

      const entity = await api.getEntity(path);

      if (isGroup(entity)) {
        // Cache non-group children (datasets, datatypes and links)
        entity.children.forEach((child) => {
          if (!isGroup(child)) {
            childCache.set(child.path, child);
          }
        });
      }

      return entity;
    });

    store.prefetch('/'); // pre-fetch root group
    return store;
  }, [api]);

  const valuesStore = useMemo(() => {
    const store = createFetchStore(api.getValue.bind(api), (a, b) => {
      return a.dataset.path === b.dataset.path && a.selection === b.selection;
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
    const store = createFetchStore(
      api.getAttrValues.bind(api),
      (a, b) => a.path === b.path,
    );

    return Object.assign(store, {
      getSingle: (entity: Entity, attrName: AttrName) => {
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
        getSearchablePaths: api.getSearchablePaths?.bind(api),
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default DataProvider;
