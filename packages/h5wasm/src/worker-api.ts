import { isTypedArray } from '@h5web/shared/guards';
import { type ProvidedEntity } from '@h5web/shared/hdf5-models';
import { transfer } from 'comlink';
import { Attribute, Dataset, File as H5WasmFile } from 'h5wasm';

import { fetchFirstBlock, LazyFile } from './lazy-file';
import {
  createLazyFileNode,
  getAvailableFileName,
  initH5Wasm,
  mountWorkerFS,
  parseEntity,
  PLUGINS_FOLDER,
  readSelectedValue,
  withReadErrors,
  WORKERFS_FOLDER,
} from './worker-utils';

const h5wasmReady = initH5Wasm();
const fileRemovers = new Map<bigint, () => void>(); // to remove files from Emscripten FS once closed

function openH5WasmFile(
  path: string,
  mode: 'r' | 'Sr',
  removeFile: () => void,
): bigint {
  try {
    const { file_id } = withReadErrors(() => new H5WasmFile(path, mode));
    fileRemovers.set(file_id, removeFile);
    return file_id;
  } catch (error) {
    removeFile();
    throw error;
  }
}

async function openFileBuffer(buffer: ArrayBuffer): Promise<bigint> {
  const h5wasm = await h5wasmReady;

  const { FS } = h5wasm;
  const fileName = getAvailableFileName(FS);

  FS.writeFile(fileName, new Uint8Array(buffer), { flags: 'w+' });

  return openH5WasmFile(fileName, 'r', () => FS.unlink(fileName));
}

async function openLocalFile(file: File): Promise<bigint> {
  const h5wasm = await h5wasmReady;
  const rootNode = await mountWorkerFS(h5wasm);

  const { FS } = h5wasm;
  const fileName = getAvailableFileName(FS, WORKERFS_FOLDER);

  const { WORKERFS } = FS.filesystems;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  WORKERFS.createNode(rootNode, fileName, WORKERFS.FILE_MODE, 0, file);

  const { file_id } = new H5WasmFile(`${WORKERFS_FOLDER}/${fileName}`, 'Sr'); // SWMR in case file is opened for writing in a concurrent process
  return file_id;
}

async function openRemoteFile(url: string): Promise<bigint> {
  const result = await fetchFirstBlock(url);

  if (!result.isPartial) {
    // eslint-disable-next-line no-console
    console.warn(
      `Server does not support range requests; ${url} was fetched in full`,
    );
    return openFileBuffer(result.buffer);
  }

  const h5wasm = await h5wasmReady;
  const rootNode = await mountWorkerFS(h5wasm);

  const { FS } = h5wasm;
  const fileName = getAvailableFileName(FS, WORKERFS_FOLDER);

  const { size, version, firstBlock } = result;
  const lazyFile = new LazyFile(url, size, version, firstBlock);
  const removeNode = createLazyFileNode(FS, rootNode, fileName, lazyFile);

  return openH5WasmFile(`${WORKERFS_FOLDER}/${fileName}`, 'r', () => {
    removeNode();
    lazyFile.clearCache();
  });
}

async function closeFile(fileId: bigint): Promise<number> {
  const h5wasm = await h5wasmReady;
  const status = h5wasm.close_file(fileId);

  fileRemovers.get(fileId)?.();
  fileRemovers.delete(fileId);

  return status;
}

async function getEntity(
  fileId: bigint,
  path: string,
): Promise<ProvidedEntity> {
  const h5wasm = await h5wasmReady;
  return withReadErrors(() => parseEntity(h5wasm, fileId, path));
}

async function getValue(
  fileId: bigint,
  path: string,
  selection?: string,
): Promise<unknown> {
  const value = withReadErrors(() =>
    readSelectedValue(new Dataset(fileId, path), selection),
  );
  return isTypedArray(value) ? transfer(value, [value.buffer]) : value;
}

async function getAttrValue(
  fileId: bigint,
  path: string,
  attrName: string,
): Promise<unknown> {
  return withReadErrors(() => new Attribute(fileId, path, attrName).json_value);
}

async function getDescendantPaths(
  fileId: bigint,
  rootPath: string,
): Promise<string[]> {
  const h5wasm = await h5wasmReady;
  return withReadErrors(() =>
    h5wasm
      .get_names(fileId, rootPath, true)
      .map((path) => `${rootPath}${path}`),
  );
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
  openRemoteFile,
  closeFile,
  getEntity,
  getValue,
  getAttrValue,
  getDescendantPaths,
  isPluginLoaded,
  loadPlugin,
};

export default api;
export type H5WasmWorkerAPI = typeof api;
