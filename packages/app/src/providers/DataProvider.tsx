import { isGroup } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';
import { getNameFromPath } from '@h5web/shared/hdf5-utils';
import { createFetchStore } from '@h5web/shared/react-suspense-fetch';
import {
  hashKey,
  QueryClient,
  QueryClientProvider,
  queryOptions,
} from '@tanstack/react-query';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

import { type DataProviderApi } from './api';
import { type AttrValuesStore, type EntitiesStore } from './models';
import {
  createProgressStore,
  type ProgressStore,
  trackProgress,
} from './progress-store';

function getQueryOptionsFactories(
  api: DataProviderApi,
  scope: string,
  progressStore: ProgressStore,
) {
  return {
    value: (dataset: Dataset<ScalarShape | ArrayShape>, selection?: string) => {
      const queryKey = [scope, 'value', dataset.path, selection] as const;
      const queryHash = hashKey(queryKey);

      return queryOptions({
        queryKey,
        queryFn: async ({ signal }) => {
          return trackProgress(progressStore, queryHash, async (onProgress) => {
            return api.getValue({ dataset, selection }, signal, onProgress);
          });
        },
      });
    },
  };
}

export interface DataContextValue {
  filepath: string;
  filename: string;
  queries: ReturnType<typeof getQueryOptionsFactories>;
  queryClient: QueryClient;
  progressStore: ProgressStore;
  entitiesStore: EntitiesStore;
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

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            networkMode: 'always', // always fire queries regardless of online/offline status
            staleTime: 'static', // never ever refetch cached data
            gcTime: 15 * 60 * 1000, // keep cached data with no active queries for 15 min
            retry: false, // never retry fetching automatically on error
            structuralSharing: false, // not relevant since data is never refetched
          },
        },
      }),
  );

  const [progressStore] = useState(createProgressStore);

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

  const attrValuesStore = useMemo(() => {
    return createFetchStore(
      api.getAttrValues.bind(api),
      (a, b) => a.path === b.path,
    );
  }, [api]);

  const value = useMemo(() => {
    const { filepath } = api;

    return {
      filepath,
      filename: getNameFromPath(filepath),
      queries: getQueryOptionsFactories(api, filepath, progressStore),
      queryClient,
      progressStore,
      entitiesStore,
      attrValuesStore,
      getExportURL: api.getExportURL?.bind(api),
      getSearchablePaths: api.getSearchablePaths?.bind(api),
    };
  }, [api, entitiesStore, attrValuesStore, queryClient, progressStore]);

  return (
    <QueryClientProvider client={queryClient}>
      <DataContext.Provider value={value}>{children}</DataContext.Provider>
    </QueryClientProvider>
  );
}

export default DataProvider;
