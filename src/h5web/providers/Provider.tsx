import type { ReactElement, ReactNode } from 'react';
import { useAsync } from 'react-use';
import { ProviderAPI, ProviderContext } from './context';
import styles from '../visualizer/Visualizer.module.css';

interface Props {
  api: ProviderAPI;
  children: ReactNode;
}

const values = new Map();

function Provider(props: Props): ReactElement {
  const { api, children } = props;

  // Wait until metadata is fetched before rendering app
  const { value: metadata, error } = useAsync(async () => {
    return api.fetchMetadata();
  }, [api]);

  if (error) {
    return <p className={styles.error}>Error: {error.message}</p>;
  }

  if (!metadata) {
    return <p className={styles.fallback}>Loading...</p>;
  }

  const fetchValue = api.fetchValue.bind(api);

  return (
    <ProviderContext.Provider
      value={{
        domain: api.domain,
        metadata,
        values,
        fetchValue,
        fetchValues: async (datasets) =>
          Promise.all(datasets.map(async ({ id }) => fetchValue(id))),
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
