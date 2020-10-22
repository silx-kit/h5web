import React, { ReactNode } from 'react';
import { useAsync } from 'react-use';
import { ProviderAPI, ProviderContext } from './context';

interface Props {
  api?: ProviderAPI;
  children: ReactNode;
}

function Provider(props: Props): JSX.Element {
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
        getValues: (idsRecord) =>
          Promise.all(
            Object.entries(idsRecord).map(([name, id]) =>
              getValue(id).then((val) => [name, val])
            )
          ).then(Object.fromEntries),
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
