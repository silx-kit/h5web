import { Group as H5WasmGroup, Dataset as H5WasmDataset } from 'h5wasm';

import type { H5WasmEntity } from './models';

// https://www.loc.gov/preservation/digital/formats/fdd/fdd000229.shtml
const HDF5_MAGIC_NUMBER = [0x89, 0x48, 0x44, 0x46, 0x0d, 0x0a, 0x1a, 0x0a]; // ASCII: \211 HDF \r \n \032 \n

export function isHDF5(buffer: ArrayBuffer): boolean {
  return new Uint8Array(buffer.slice(0, HDF5_MAGIC_NUMBER.length)).every(
    (num, i) => num === HDF5_MAGIC_NUMBER[i]
  );
}

export function isH5WasmGroup(entity: H5WasmEntity): entity is H5WasmGroup {
  return entity instanceof H5WasmGroup;
}

export function isH5WasmDataset(entity: H5WasmEntity): entity is H5WasmDataset {
  return entity instanceof H5WasmDataset;
}

export function assertH5WasmDataset(
  entity: H5WasmEntity
): asserts entity is H5WasmDataset {
  if (!isH5WasmDataset(entity)) {
    throw new Error('Expected H5Wasm entity to be dataset');
  }
}

export function assertH5WasmEntityWithAttrs(
  entity: H5WasmEntity
): asserts entity is H5WasmGroup | H5WasmDataset {
  if (!isH5WasmGroup(entity) && !isH5WasmDataset(entity)) {
    throw new Error('Expected H5Wasm entity with attributes');
  }
}
