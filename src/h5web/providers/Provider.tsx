import { ReactElement, ReactNode, useMemo } from 'react';
import { useAsync } from 'react-use';
import { createFetchStore } from 'react-suspense-fetch';
import { ProviderAPI, ProviderContext } from './context';
import ErrorMessage from '../visualizer/ErrorMessage';
import styles from '../visualizer/Visualizer.module.css';
import type { Entity } from './models';
import { isGroup } from '../guards';

interface Props {
  api: ProviderAPI;
  children: ReactNode;
}

function Provider(props: Props): ReactElement {
  const { api, children } = props;

  // Wait until metadata is fetched before rendering app
  const { value: metadata, error } = useAsync(async () => {
    return api.getMetadata();
  }, [api]);

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
            childCache.set(path, entity);
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

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!metadata) {
    return <p className={styles.fallback}>Loading...</p>;
  }

  return (
    <ProviderContext.Provider
      value={{
        domain: api.domain,
        metadata,
        entitiesStore,
        valuesStore,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
