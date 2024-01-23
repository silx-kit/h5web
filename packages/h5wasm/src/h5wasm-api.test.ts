import {
  assertDataset,
  assertGroup,
  assertGroupWithChildren,
  hasNonNullShape,
} from '@h5web/shared/guards';
import type {
  ArrayShape,
  Dataset,
  ScalarShape,
} from '@h5web/shared/hdf5-models';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { expect, test } from 'vitest';

import { H5WasmApi } from './h5wasm-api';

const LOCAL_TEST_FILE = path.resolve(__dirname, '../dist-h5/sample.h5');
const REMOTE_TEST_FILE = 'http://www.silx.org/pub/h5web/sample.h5'; // `https` would complicate things...

async function loadTestFile(): Promise<ArrayBuffer> {
  if (existsSync(LOCAL_TEST_FILE)) {
    return readFile(LOCAL_TEST_FILE);
  }

  const resp = await fetch(REMOTE_TEST_FILE);
  return resp.arrayBuffer();
}

async function getValueOrError(
  api: H5WasmApi,
  dataset: Dataset<ArrayShape | ScalarShape>,
): Promise<unknown> {
  try {
    return await api.getValue({ dataset });
  } catch (error) {
    return error;
  }
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
