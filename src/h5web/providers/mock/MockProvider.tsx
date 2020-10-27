import React, { ReactNode } from 'react';
import Provider from '../Provider';
import { mockMetadata, mockValues } from './data';
import { HDF5Id, HDF5Values } from '../models';

interface Props {
  domain: string;
  children: ReactNode;
}

function MockProvider(props: Props): JSX.Element {
  const { domain, children } = props;

  return (
    <Provider
      api={{
        domain,
        getMetadata: async () => mockMetadata,
        getValue: async (id: HDF5Id) => (mockValues as HDF5Values)[id],
      }}
    >
      {children}
    </Provider>
  );
}

export default MockProvider;
