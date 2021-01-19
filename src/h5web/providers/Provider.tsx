import { ReactElement, ReactNode, useMemo } from 'react';
import { createFetchStore } from 'react-suspense-fetch';
import { ProviderAPI, ProviderContext } from './context';
import type { Entity } from './models';
import { isGroup } from '../guards';

interface Props {
  api: ProviderAPI;
  children: ReactNode;
}

function Provider(props: Props): ReactElement {
  const { api, children } = props;

  const entitiesStore = useMemo(() => {
    const childCache = new Map<string, Entity>();

    const store = createFetchStore(async (path: string) => {
      if (childCache.has(path)) {
        return childCache.get(path) as Entity;
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
    return createFetchStore(api.getValue.bind(api));
  }, [api]);

  return (
    <ProviderContext.Provider
      value={{
        domain: api.domain,
        entitiesStore,
        valuesStore,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
