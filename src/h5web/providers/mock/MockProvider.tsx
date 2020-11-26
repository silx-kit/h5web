import React, { ReactElement, ReactNode } from 'react';
import Provider from '../Provider';
import { mockMetadata, mockValues } from './data';
import type { HDF5Id, HDF5Values } from '../models';

export const MOCK_DOMAIN = 'source.h5';

interface Props {
  domain?: string;
  errorOnId?: string;
  children: ReactNode;
}

function MockProvider(props: Props): ReactElement {
  const { domain = MOCK_DOMAIN, errorOnId, children } = props;

  return (
    <Provider
      api={{
        domain,
        getMetadata: async () => mockMetadata,
        getValue: async (id: HDF5Id) => {
          if (id === errorOnId) {
            // Throw error when trying to fetch value of dataset with ID `raw`
            throw new Error('error');
          }

          return (mockValues as HDF5Values)[id];
        },
      }}
    >
      {children}
    </Provider>
  );
}

export default MockProvider;
