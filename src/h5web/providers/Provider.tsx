import React, { ReactNode } from 'react';
import { ProviderAPI, ProviderContext } from './context';

interface Props {
  api?: ProviderAPI;
  children: ReactNode;
}

function Provider(props: Props): JSX.Element {
  const { api, children } = props;

  if (!api) {
    return <></>;
  }

  return (
    <ProviderContext.Provider
      value={{
        getDomain: api.getDomain.bind(api),
        getMetadata: api.getMetadata.bind(api),
        getValue: api.getValue.bind(api),
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export default Provider;
