import { isGroup } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type Entity,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';
import { getNameFromPath } from '@h5web/shared/hdf5-utils';
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
import {
  createProgressStore,
  type ProgressStore,
  trackProgress,
} from './progress-store';

function getQueryOptionsFactories(
  api: DataProviderApi,
  scope: string,
  queryClient: QueryClient,
  progressStore: ProgressStore,
) {
  return {
    entity: (path: string) => {
      return queryOptions({
        queryKey: [scope, 'entity', path] as const,
        queryFn: async () => {
          const entity = await api.getEntity(path);

          if (isGroup(entity)) {
            // Cache non-group children (datasets, datatypes and links)
            entity.children
              .filter((c) => !isGroup(c))
              .forEach((c) => {
                queryClient.setQueryData([scope, 'entity', c.path], c);
              });
          }

          return entity;
        },
      });
    },
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
    attrValues: (entity: Entity) => {
      return queryOptions({
        queryKey: [scope, 'attrValues', entity.path] as const,
        queryFn: async () => api.getAttrValues(entity),
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

  const value = useMemo(() => {
    const { filepath } = api;

    return {
      filepath,
      filename: getNameFromPath(filepath),
      queries: getQueryOptionsFactories(
        api,
        filepath,
        queryClient,
        progressStore,
      ),
      queryClient,
      progressStore,
      getExportURL: api.getExportURL?.bind(api),
      getSearchablePaths: api.getSearchablePaths?.bind(api),
    };
  }, [api, queryClient, progressStore]);

  return (
    <QueryClientProvider client={queryClient}>
      <DataContext.Provider value={value}>{children}</DataContext.Provider>
    </QueryClientProvider>
  );
}

export default DataProvider;
