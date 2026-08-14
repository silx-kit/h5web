import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { assertEnvVar } from '@h5web/shared/guards';
import { beforeAll, expect, test } from 'vitest';

import remote from './worker';

const SKIP = import.meta.env.VITE_H5WASM_SKIP === 'true';
const TEST_FILE_PATH = import.meta.env.VITE_H5WASM_DIM_SCALES_TEST_FILE;
assertEnvVar(TEST_FILE_PATH, 'VITE_H5WASM_DIM_SCALES_TEST_FILE');

const TEST_FILE = path.resolve(process.cwd(), TEST_FILE_PATH);

beforeAll(() => {
  if (!existsSync(TEST_FILE)) {
    throw new Error("Dimension scales sample file doesn't exist");
  }
});

async function openTestFile(): Promise<bigint> {
  const { buffer } = new Uint8Array(await readFile(TEST_FILE)); // https://stackoverflow.com/a/79345743
  return remote.openFileBuffer(buffer);
}

test.skipIf(SKIP)('read scale attached to dataset dimension', async () => {
  const fileId = await openTestFile();
  const dimScales = await remote.getDimensionScales(fileId, '/tsin1divt');

  // One entry per dimension, holding the scale `attach_scale` recorded
  expect(dimScales).toEqual([[{ path: '/times', name: 'times' }]]);
});

test.skipIf(SKIP)('read no scales for the scale dataset itself', async () => {
  const fileId = await openTestFile();

  // `times` is a dimension scale, but has none of its own attached
  await expect(remote.getDimensionScales(fileId, '/times')).resolves.toEqual([
    [],
  ]);
});

test.skipIf(SKIP)('report an unnamed scale as having no name', async () => {
  const fileId = await openTestFile();
  const dimScales = await remote.getDimensionScales(
    fileId,
    '/tsin1divt_unnamed_scale',
  );

  /* `make_scale()` with no argument records an empty NAME rather than omitting
   * it, so the name must be normalised away for the label to fall back. */
  expect(dimScales).toEqual([[{ path: '/times_unnamed', name: undefined }]]);
});

test.skipIf(SKIP)('read dimension labels as a plain attribute', async () => {
  const fileId = await openTestFile();

  // Labels come from `DIMENSION_LABELS`, which needs no dedicated provider API
  const labels = await remote.getAttrValue(
    fileId,
    '/tsin1divt',
    'DIMENSION_LABELS',
  );

  expect(labels).toEqual(['time']);
});
