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
  const { buffer } = new Uint8Array(await readFile(TEST_FILE)); // https://stackoverflow.com/a/79345743
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

function processValue(value: unknown, child: Dataset): unknown {
  const { type } = child;

  // Hide unstable H5T_REFERENCE values from snapshot
  if (type.class === DTypeClass.Reference) {
    return `Uint8Array (unstable)`;
  }

  return value;
}
