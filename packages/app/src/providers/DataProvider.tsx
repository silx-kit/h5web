import { isGroup } from '@h5web/shared/guards';
import { type Entity } from '@h5web/shared/hdf5-models';
import { getNameFromPath } from '@h5web/shared/hdf5-utils';
import { createFetchStore } from '@h5web/shared/react-suspense-fetch';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from 'react';

import { hasAttribute } from '../utils';
import { type DataProviderApi } from './api';
import {
  type AttrName,
  type AttrValuesStore,
  type EntitiesStore,
  type ValuesStore,
} from './models';

export interface DataContextValue {
  filepath: string;
  filename: string;
  entitiesStore: EntitiesStore;
  valuesStore: ValuesStore;
  attrValuesStore: AttrValuesStore;

  // Undocumented
  getExportURL?: DataProviderApi['getExportURL'];
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
    const store = createFetchStore(async (path: string) => {
      const entity = await api.getEntity(path);

      if (isGroup(entity)) {
        // Cache non-group children (datasets, datatypes and links)
        entity.children.forEach((child) => {
          if (!isGroup(child)) {
            store.preset(child.path, child);
          }
        });
      }

      return entity;
    });

    store.prefetch('/'); // pre-fetch root group
    return store;
  }, [api]);

  const valuesStore = useMemo(() => {
    return createFetchStore(api.getValue.bind(api), (a, b) => {
      return a.dataset.path === b.dataset.path && a.selection === b.selection;
    });
  }, [api]);

  const attrValuesStore = useMemo(() => {
    const store = createFetchStore(
      api.getAttrValues.bind(api),
      (a, b) => a.path === b.path,
    );

    return Object.assign(store, {
      getSingle: async (entity: Entity, attrName: AttrName) => {
        if (!hasAttribute(entity, attrName)) {
          return undefined;
        }
        const attrs = await attrValuesStore.get(entity);
        return attrs[attrName];
      },
    });
  }, [api]);

  return (
    <DataContext
      value={{
        filepath: api.filepath,
        filename: getNameFromPath(api.filepath),
        entitiesStore,
        valuesStore,
        attrValuesStore,
        getExportURL: api.getExportURL?.bind(api),
        getSearchablePaths: api.getSearchablePaths?.bind(api),
      }}
    >
      {children}
    </DataContext>
  );
}

export default DataProvider;
