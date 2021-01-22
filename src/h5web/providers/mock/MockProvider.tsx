import type { ReactElement, ReactNode } from 'react';
import Provider from '../Provider';
import { mockMetadata, mockDomain } from './metadata';
import { findMockEntity, findMockDataset } from './utils';

interface Props {
  domain?: string;
  slowOnPath?: string;
  errorOnPath?: string;
  children: ReactNode;
}

function MockProvider(props: Props): ReactElement {
  const { domain = mockDomain, errorOnPath, slowOnPath, children } = props;

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
        getValue: async (path: string) => {
          if (path === errorOnPath) {
            // Throw error when fetching value with specific ID
            throw new Error('error');
          }

          const { value } = findMockDataset(path);
          return value;
        },
      }}
    >
      {children}
    </Provider>
  );
}

export default MockProvider;
