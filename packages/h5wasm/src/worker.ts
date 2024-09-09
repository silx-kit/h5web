import { isTypedArray } from '@h5web/shared/guards';
import type { ProvidedEntity } from '@h5web/shared/hdf5-models';
import { expose, transfer } from 'comlink';
import { Attribute, Dataset } from 'h5wasm';

import {
  getAvailableFileName,
  initH5Wasm,
  mountWorkerFS,
  parseEntity,
  PLUGINS_FOLDER,
  readSelectedValue,
  WORKERFS_FOLDER,
} from './worker-utils';

const h5wasmReady = initH5Wasm();

async function openFileBuffer(buffer: ArrayBuffer): Promise<bigint> {
  const h5wasm = await h5wasmReady;

  const { FS } = h5wasm;
  const fileName = getAvailableFileName(FS);

  FS.writeFile(fileName, new Uint8Array(buffer), { flags: 'w+' });

  return h5wasm.open(fileName, undefined, undefined); // https://github.com/emscripten-core/emscripten/issues/22389
}

async function openLocalFile(file: File): Promise<bigint> {
  const h5wasm = await h5wasmReady;
  const rootNode = await mountWorkerFS(h5wasm);

  const { FS } = h5wasm;
  const fileName = getAvailableFileName(FS, WORKERFS_FOLDER);

  const { WORKERFS } = FS.filesystems;
  WORKERFS.createNode(rootNode, fileName, WORKERFS.FILE_MODE, 0, file);

  return h5wasm.open(`${WORKERFS_FOLDER}/${fileName}`, undefined, undefined); // https://github.com/emscripten-core/emscripten/issues/22389
}

async function closeFile(fileId: bigint): Promise<number> {
  const h5wasm = await h5wasmReady;
  return h5wasm.close_file(fileId);
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

async function getDescendantPaths(fileId: bigint, rootPath: string) {
  const h5wasm = await h5wasmReady;
  return h5wasm
    .get_names(fileId, rootPath, true)
    .map((path) => `${rootPath}${path}`);
}

async function isPluginLoaded(plugin: string): Promise<boolean> {
  const pluginPath = `/${PLUGINS_FOLDER}/libH5Z${plugin}.so`;

  const { FS } = await h5wasmReady;
  return FS.analyzePath(pluginPath).exists;
}

async function loadPlugin(plugin: string, buffer: ArrayBuffer): Promise<void> {
  const pluginPath = `/${PLUGINS_FOLDER}/libH5Z${plugin}.so`;

  const { FS } = await h5wasmReady;
  FS.writeFile(pluginPath, new Uint8Array(buffer));
}

const api = {
  openFileBuffer,
  openLocalFile,
  closeFile,
  getEntity,
  getValue,
  getAttrValue,
  getDescendantPaths,
  isPluginLoaded,
  loadPlugin,
};

export default api; // to allow testing in Node (without Web Worker)
export type H5WasmWorkerAPI = typeof api;

if (import.meta.env.MODE !== 'test') {
  expose(api);
}
