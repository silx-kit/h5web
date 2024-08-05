import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getValueOrError } from '@h5web/app';
import {
  assertDataset,
  assertEnvVar,
  assertGroup,
  assertGroupWithChildren,
  hasNonNullShape,
} from '@h5web/shared/guards';
import type { Dataset } from '@h5web/shared/hdf5-models';
import { DTypeClass } from '@h5web/shared/hdf5-models';
import { beforeAll, expect, test } from 'vitest';

import { H5WasmApi } from './h5wasm-api';
import remote from './worker';

const SKIP = import.meta.env.VITE_H5WASM_SKIP === 'true';
const H5WASM_TEST_FILE = import.meta.env.VITE_H5WASM_TEST_FILE;
assertEnvVar(H5WASM_TEST_FILE, 'VITE_H5WASM_TEST_FILE');

const TEST_FILE = path.resolve(process.cwd(), H5WASM_TEST_FILE);

beforeAll(() => {
  if (!existsSync(TEST_FILE)) {
    throw new Error("Sample file doesn't exist");
  }
});

test.skipIf(SKIP)('test file matches snapshot', async () => {
  const buffer = await readFile(TEST_FILE);
  const fileId = remote.openFileBuffer(buffer);

  const api = new H5WasmApi(remote, 'sample.h5', fileId);

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

      return {
        name,
        shape,
        type,
        rawType,
        value: processValue(value, child),
      };
    }),
  );

  expect(children).toMatchSnapshot();
});

// Hide unstable uint8 value arrays for H5T_VLEN and H5T_REFERENCE datasets from snapshot
function processValue(value: unknown, child: Dataset): unknown {
  const { name, type } = child;

  if (type.class === DTypeClass.Reference || type.class === DTypeClass.VLen) {
    return `Uint8Array (unstable)`;
  }

  // Special case for compound dataset with H5T_VLEN field
  if (name === 'compound_array_vlen_1D') {
    return (value as [number[], Uint8Array][]).map((item) => [
      item[0],
      `Uint8Array (unstable)`,
    ]);
  }

  return value;
}
