import {
  assertDataset,
  assertEnvVar,
  assertGroup,
  assertGroupWithChildren,
  hasNonNullShape,
} from '@h5web/shared/guards';
import { beforeAll, expect, test } from 'vitest';

import { assertListeningAt } from '../../test-utils';
import { getValueOrError } from '../utils';
import { H5GroveApi } from './h5grove-api';

const H5GROVE_URL = import.meta.env.VITEST_H5GROVE_URL;
const TEST_FILE = import.meta.env.VITEST_H5GROVE_TEST_FILE;
assertEnvVar(H5GROVE_URL, 'VITE_H5GROVE_URL');
assertEnvVar(TEST_FILE, 'VITE_TEST_FILE');

beforeAll(async () => {
  await assertListeningAt(H5GROVE_URL);
});

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
