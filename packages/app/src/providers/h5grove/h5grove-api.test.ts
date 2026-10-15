import { assertEnvVar } from '@h5web/shared/guards';
import { beforeAll, expect, test } from 'vitest';

import { getGroupSnapshot } from '../test-utils';
import { H5GroveApi } from './h5grove-api';

const SKIP = import.meta.env.VITE_H5GROVE_SKIP === 'true';
const H5GROVE_URL = import.meta.env.VITE_H5GROVE_URL;
assertEnvVar(H5GROVE_URL, 'VITE_H5GROVE_URL');

beforeAll(async () => {
  try {
    await fetch(H5GROVE_URL);
  } catch (error) {
    throw new Error(`Expected server listening at ${H5GROVE_URL}`, {
      cause: error,
    });
  }
});

test.skipIf(SKIP).each(['sample.h5', 'links.h5'])(
  'test file `%s` matches snapshot',
  async (filename) => {
    const api = new H5GroveApi(H5GROVE_URL, filename);
    const root = await getGroupSnapshot(api, '/');
    expect(root.children).toMatchSnapshot();
  },
);
