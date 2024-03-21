import {
  assertDataset,
  assertGroup,
  assertGroupWithChildren,
  hasNonNullShape,
} from '@h5web/shared/guards';
import { expect, test } from 'vitest';

import { getValueOrError } from '../utils';
import { H5GroveApi } from './h5grove-api';

const H5GROVE_URL = 'http://localhost:8888'; // when running `pnpm support:h5grove`
const TEST_FILE = 'sample.h5';

test('test file matches snapshot', async () => {
  const api = new H5GroveApi(H5GROVE_URL, TEST_FILE, {
    params: { file: TEST_FILE },
  });

  const root = await api.getEntity('/');
  assertGroup(root);
  assertGroupWithChildren(root);

  const children = await Promise.all(
    root.children.map(async (child) => {
      assertDataset(child);
      const { name, shape, type, rawType } = child;

      const value = hasNonNullShape(child)
        ? await getValueOrError(api, child)
        : null;

      return { name, shape, type, rawType, value };
    }),
  );

  expect(children).toMatchSnapshot();
});
