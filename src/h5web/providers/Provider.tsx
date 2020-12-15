import React, { ReactElement, ReactNode } from 'react';
import { useAsync } from 'react-use';
import { ProviderAPI, ProviderContext } from './context';
import styles from '../visualizer/Visualizer.module.css';

interface Props {
  api: ProviderAPI;
  children: ReactNode;
}

function Provider(props: Props): ReactElement {
  const { api, children } = props;

  // Wait until metadata is fetched before rendering app
  const { value: metadata, error } = useAsync(async () => api.getMetadata(), [
    api,
  ]);

  if (error) {
    return <p className={styles.error}>Error: {error.message}</p>;
  }

  if (!metadata) {
    return <p className={styles.fallback}>Loading...</p>;
  }

  const getValue = api.getValue.bind(api);

  return (
    <ProviderContext.Provider
      value={{
        domain: api.domain,
        metadata,
        getValue,
        getValues: async (datasets) =>
          Object.fromEntries(
            await Promise.all(
              datasets.map(async ({ id, name }) => [name, await getValue(id)])
            )
          ),
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
