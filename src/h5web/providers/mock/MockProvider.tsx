import type { ReactElement, ReactNode } from 'react';
import Provider from '../Provider';
import { mockMetadata, mockValues, mockDomain } from './data';
import { findMockEntity } from './utils';

interface Props {
  domain?: string;
  slowOnPath?: string;
  errorOnId?: string;
  children: ReactNode;
}

function MockProvider(props: Props): ReactElement {
  const { domain = mockDomain, errorOnId, slowOnPath, children } = props;

  return (
    <Provider
      api={{
        domain,
        getEntity: async (path: string) => {
          if (path === slowOnPath) {
            await new Promise((resolve) => {
              setTimeout(resolve, 3000);
            });
          }

          return findMockEntity(mockMetadata, path);
        },
        getValue: async (id: keyof typeof mockValues) => {
          if (id === errorOnId) {
            // Throw error when fetching value with specific ID
            throw new Error('error');
          }

          return mockValues[id];
        },
      }}
    >
      {children}
    </Provider>
  );
}

export default MockProvider;
