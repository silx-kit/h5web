import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { getGroupSnapshot } from '@h5web/app';
import { type Dataset, DTypeClass } from '@h5web/shared/hdf5-models';
import { expect, test } from 'vitest';

import { H5WasmApi } from './h5wasm-api';
import remote from './worker';

const SKIP = import.meta.env.VITE_H5WASM_SKIP === 'true';

test.skipIf(SKIP).each(['sample.h5', 'links.h5'])(
  'test file `%s` matches snapshot',
  async (filename) => {
    const filePath = resolve(process.cwd(), `support/files/dist/${filename}`);
    expect(existsSync(filePath), `${filename} doesn't exist`).toBe(true);

    const { buffer } = new Uint8Array(await readFile(filePath)); // https://stackoverflow.com/a/79345743
    const fileId = remote.openFileBuffer(buffer);

    const api = new H5WasmApi(remote, filename, fileId);
    const root = await getGroupSnapshot(api, '/', processValue);

    expect(root.children).toMatchSnapshot();
  },
);

function processValue(value: unknown, child: Dataset): unknown {
  const { type } = child;

  // Hide unstable H5T_REFERENCE values from snapshot
  if (type.class === DTypeClass.Reference) {
    return `Uint8Array (unstable)`;
  }

  return value;
}
