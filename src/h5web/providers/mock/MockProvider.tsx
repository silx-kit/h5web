import type { ReactNode } from 'react';
import Provider from '../Provider';
import { mockFilepath } from './metadata';
import { assertMockDataset, findMockEntity } from './utils';
import type { GetValueParams } from '../context';
import ndarray from 'ndarray';
import { assertPrintableType, assertArrayShape } from '../../guards';
import unpack from 'ndarray-unpack';
import type { Primitive } from '../models';
import type { PrintableType } from '../../vis-packs/core/models';

interface Props {
  filepath?: string;
  slowOnPath?: string;
  errorOnPath?: string;
  children: ReactNode;
}

function MockProvider(props: Props) {
  const { filepath = mockFilepath, errorOnPath, slowOnPath, children } = props;

  return (
    <Provider
      api={{
        filepath,
        getEntity: async (path: string) => {
          if (path === slowOnPath) {
            await new Promise((resolve) => {
              setTimeout(resolve, 3000);
            });
          }

          return findMockEntity(path);
        },
        getValue: async (params: GetValueParams) => {
          const { path, selection } = params;

          if (path === errorOnPath) {
            // Throw error when fetching value with specific ID
            throw new Error('error');
          }

          const dataset = findMockEntity(path);
          assertMockDataset(dataset);

          const { value } = dataset;
          if (!selection) {
            return value;
          }

          assertArrayShape(dataset);
          assertPrintableType(dataset);

          const dataArray = ndarray(
            (dataset.value as Primitive<PrintableType>[]).flat(
              dataset.shape.length - 1
            ),
            dataset.shape
          );

          const dataView = dataArray.pick(
            ...selection
              .split(',')
              .map((s) => (s === ':' ? null : Number.parseInt(s, 10)))
          );

          return unpack(dataView);
        },
      }}
    >
      {children}
    </Provider>
  );
}

export default MockProvider;
