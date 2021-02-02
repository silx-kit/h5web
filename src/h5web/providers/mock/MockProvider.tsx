import type { ReactElement, ReactNode } from 'react';
import Provider from '../Provider';
import { mockDomain } from './metadata';
import { assertMockDataset, findMockEntity } from './utils';

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

          return findMockEntity(path);
        },
        getValue: async (path: string) => {
          if (path === errorOnPath) {
            // Throw error when fetching value with specific ID
            throw new Error('error');
          }

          const dataset = findMockEntity(path);
          assertMockDataset(dataset);

          return dataset.value;
        },
      }}
    >
      {children}
    </Provider>
  );
}

export default MockProvider;
