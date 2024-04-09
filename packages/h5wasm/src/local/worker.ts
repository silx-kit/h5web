import { isTypedArray } from '@h5web/shared/guards';
import type { ProvidedEntity } from '@h5web/shared/hdf5-models';
import { expose, transfer } from 'comlink';
import { Attribute, Dataset } from 'h5wasm';
import { nanoid } from 'nanoid';

import { readSelectedValue } from '../utils';
import { initH5Wasm, mountWorkerFS, parseEntity } from './worker.utils';

const PLUGINS_PATH = '/plugins'; // path to plugins on EMScripten virtual file system
const WORKERFS_MOUNT_PT = '/workerfs';

const h5wasmReady = initH5Wasm(PLUGINS_PATH);
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
  const value = readSelectedValue(new Dataset(fileId, path), selection);
  return isTypedArray(value) ? transfer(value, [value.buffer]) : value;
}

async function getAttrValue(
  fileId: bigint,
  path: string,
  attrName: string,
): Promise<unknown> {
  return new Attribute(fileId, path, attrName).json_value;
}

async function isPluginLoaded(plugin: string): Promise<boolean> {
  const pluginPath = `${PLUGINS_PATH}/libH5Z${plugin}.so`;

  const { FS } = await h5wasmReady;
  return FS.analyzePath(pluginPath).exists;
}

async function loadPlugin(plugin: string, buffer: ArrayBuffer): Promise<void> {
  const pluginPath = `${PLUGINS_PATH}/libH5Z${plugin}.so`;

  const { FS } = await h5wasmReady;
  FS.writeFile(pluginPath, new Uint8Array(buffer));
}

const api = {
  openFile,
  closeFile,
  getEntity,
  getValue,
  getAttrValue,
  isPluginLoaded,
  loadPlugin,
};

expose(api);

export type H5WasmWorkerAPI = typeof api;
