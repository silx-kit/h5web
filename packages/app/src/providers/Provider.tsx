import type { Entity } from '@h5web/shared';
import { assertGroupWithChildren, isGroup } from '@h5web/shared';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { createFetchStore } from 'react-suspense-fetch';

import { hasAttribute } from '../utils';
import type { ImageAttribute } from '../vis-packs/core/models';
import type { NxAttribute } from '../vis-packs/nexus/models';
import type { ProviderApi } from './api';
import { ProviderContext } from './context';

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

  const filepathMembers = api.filepath.split('/');

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
    <ProviderContext.Provider
      value={{
        filepath: api.filepath,
        filename: filepathMembers[filepathMembers.length - 1],
        entitiesStore,
        valuesStore,
        attrValuesStore,
        getTiffUrl: api.getTiffUrl?.bind(api),
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
