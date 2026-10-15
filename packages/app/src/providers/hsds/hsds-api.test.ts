import { assertEnvVar } from '@h5web/shared/guards';
import { beforeAll, expect, test } from 'vitest';

import { getGroupSnapshot } from '../test-utils';
import { HsdsApi } from './hsds-api';

const SKIP = import.meta.env.VITE_HSDS_SKIP === 'true';
const HSDS_URL = import.meta.env.VITE_HSDS_URL;
assertEnvVar(HSDS_URL, 'VITE_HSDS_URL');

beforeAll(async () => {
  try {
    await fetch(HSDS_URL);
  } catch (error) {
    throw new Error(`Expected server listening at ${HSDS_URL}`, {
      cause: error,
    });
  }
});

test.skipIf(SKIP).each(['/sample-hsds.h5', '/links-hsds.h5'])(
  'test file `%s` matches snapshot',
  async (domain) => {
    const api = new HsdsApi(HSDS_URL, domain);
    const root = await getGroupSnapshot(api, '/');
    expect(root.children).toMatchSnapshot();
  },
);
