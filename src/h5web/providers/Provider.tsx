import { ReactNode, useMemo } from 'react';
import { createFetchStore } from 'react-suspense-fetch';
import { ProviderContext } from './context';
import type { ProviderApi } from './api';
import type { Entity } from './models';
import { assertGroupWithChildren, isGroup } from '../guards';

interface Props {
  api: ProviderApi;
  children: ReactNode;
}

function Provider(props: Props) {
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
      areEqual: (a, b) => a.path === b.path && a.selection === b.selection,
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

  const filepathMembers = api.filepath.split('/');

  return (
    <ProviderContext.Provider
      value={{
        filepath: api.filepath,
        filename: filepathMembers[filepathMembers.length - 1],
        entitiesStore,
        valuesStore,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
