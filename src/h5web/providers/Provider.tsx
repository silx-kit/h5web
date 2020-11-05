import React, { ReactElement, ReactNode } from 'react';
import { useAsync } from 'react-use';
import { ProviderAPI, ProviderContext } from './context';

interface Props {
  api?: ProviderAPI;
  children: ReactNode;
}

function Provider(props: Props): ReactElement {
  const { api, children } = props;

  // Wait until metadata is fetched before rendering app
  const { value: metadata } = useAsync(async () => api?.getMetadata(), [api]);

  if (!api || !metadata) {
    return <></>;
  }

  const getValue = api.getValue.bind(api);

  return (
    <ProviderContext.Provider
      value={{
        domain: api.domain,
        metadata,
        getValue,
        getValues: async (ids) =>
          Promise.all(ids.map((id) => (id ? getValue(id) : undefined))),
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
