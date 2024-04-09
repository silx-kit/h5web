import type { ProvidedEntity } from '@h5web/shared/hdf5-models';
import { expose } from 'comlink';
import { Attribute, Dataset } from 'h5wasm';
import { nanoid } from 'nanoid';

import { readSelectedValue } from '../utils';
import { initH5Wasm, mountWorkerFS, parseEntity } from './worker.utils';

const WORKERFS_MOUNT_PT = '/workerfs';

const h5wasmReady = initH5Wasm();
const workerFSReady = mountWorkerFS(WORKERFS_MOUNT_PT);

async function openFile(file: File): Promise<bigint> {
  const h5wasm = await h5wasmReady;
  const { FS } = h5wasm;
  const { WORKERFS } = FS.filesystems;

  const rootNode = await workerFSReady;

  const fileName = nanoid();
  const filePath = `${WORKERFS_MOUNT_PT}/${fileName}`;
  if (FS.analyzePath(filePath).exists) {
    return openFile(file); // non-unique file name; try again
  }

  WORKERFS.createNode(rootNode, fileName, WORKERFS.FILE_MODE, 0, file);

  return h5wasm.ccall(
    'H5Fopen',
    'bigint',
    ['string', 'number', 'bigint'],
    [filePath, h5wasm.H5F_ACC_RDONLY, 0n],
  );
}

async function closeFile(fileId: bigint): Promise<number> {
  const h5wasm = await h5wasmReady;
  h5wasm.flush(fileId);
  return h5wasm.ccall('H5Fclose', 'number', ['bigint'], [fileId]);
}

async function getEntity(
  fileId: bigint,
  path: string,
): Promise<ProvidedEntity> {
  const h5wasm = await h5wasmReady;
  return parseEntity(h5wasm, fileId, path);
}

async function getValue(
  fileId: bigint,
  path: string,
  selection?: string | undefined,
): Promise<unknown> {
  return readSelectedValue(new Dataset(fileId, path), selection);
}

async function getAttrValue(
  fileId: bigint,
  path: string,
  attrName: string,
): Promise<unknown> {
  return new Attribute(fileId, path, attrName).json_value;
}

const api = {
  openFile,
  closeFile,
  getEntity,
  getValue,
  getAttrValue,
};

expose(api);

export type H5WasmWorkerAPI = typeof api;
