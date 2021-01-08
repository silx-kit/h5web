import { ReactElement, ReactNode, useMemo } from 'react';
import { useAsync } from 'react-use';
import { createFetchStore } from 'react-suspense-fetch';
import { ProviderAPI, ProviderContext } from './context';
import ErrorMessage from '../visualizer/ErrorMessage';
import styles from '../visualizer/Visualizer.module.css';

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

  const groupsStore = useMemo(() => {
    const store = createFetchStore(api.getGroup.bind(api));
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
        groupsStore,
        valuesStore,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
