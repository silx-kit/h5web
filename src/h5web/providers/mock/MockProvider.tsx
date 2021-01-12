import type { ReactElement, ReactNode } from 'react';
import { assertDefined } from '../../guards';
import { getEntityAtPath } from '../../utils';
import Provider from '../Provider';
import { mockMetadata, mockValues, mockDomain } from './data';

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
        getMetadata: async () => mockMetadata,
        getEntity: async (path: string) => {
          if (path === slowOnPath) {
            await new Promise((resolve) => {
              setTimeout(resolve, 3000);
            });
          }

          const entity = getEntityAtPath(mockMetadata, path, true);
          assertDefined(entity);

          return entity;
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
