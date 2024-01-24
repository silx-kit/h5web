import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getValueOrError } from '@h5web/app';
import {
  assertDataset,
  assertGroup,
  assertGroupWithChildren,
  hasNonNullShape,
} from '@h5web/shared/guards';
import { expect, test } from 'vitest';

import { H5WasmApi } from './h5wasm-api';

const LOCAL_TEST_FILE = path.resolve(process.cwd(), 'dist/sample.h5');
const REMOTE_TEST_FILE = 'http://www.silx.org/pub/h5web/sample.h5'; // `https` would complicate things...

async function loadTestFile(): Promise<ArrayBuffer> {
  if (existsSync(LOCAL_TEST_FILE)) {
    return readFile(LOCAL_TEST_FILE);
  }

  const resp = await fetch(REMOTE_TEST_FILE);
  return resp.arrayBuffer();
}

test('test file matches snapshot', async () => {
  const buffer = await loadTestFile();
  const api = new H5WasmApi('sample.h5', buffer);

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
