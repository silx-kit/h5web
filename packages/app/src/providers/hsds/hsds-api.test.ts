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
import { HsdsApi } from './hsds-api';

const SKIP = import.meta.env.VITE_HSDS_SKIP === 'true';
const HSDS_URL = import.meta.env.VITE_HSDS_URL;
const HSDS_TEST_DOMAIN = import.meta.env.VITE_HSDS_TEST_DOMAIN;
assertEnvVar(HSDS_URL, 'VITE_HSDS_URL');
assertEnvVar(HSDS_TEST_DOMAIN, 'VITE_HSDS_TEST_DOMAIN');

beforeAll(async () => {
  await assertListeningAt(HSDS_URL);
});

test.skipIf(SKIP)('test file matches snapshot', async () => {
  const api = new HsdsApi(HSDS_URL, HSDS_TEST_DOMAIN);

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
