import {
  type ChildEntity,
  type Entity,
  type Group,
  isGroup,
} from '@h5web/shared';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import { createFetchStore } from 'react-suspense-fetch';

import { hasAttribute } from '../utils';
import { type DataProviderApi } from './api';
import {
  type AttrName,
  type AttrValuesStore,
  type EntitiesStore,
  type ProgressCallback,
  type ValuesStore,
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
