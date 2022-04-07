import type { DType } from '@h5web/shared';
import { assertStr } from '@h5web/shared';
import {
  ready as H5WasmReady,
  File as H5WasmFile,
  FS as H5WasmFS,
} from 'h5wasm';

import type { ValuesStoreParams } from '../models';
import { convertDtype } from '../utils';
import type { H5WasmSourceType } from './H5WasmProvider';

const BACKING_FILE = 'current.h5';

function unlinkBackingFile() {
  const { exists } = H5WasmFS.analyzePath(BACKING_FILE);
  if (exists) {
    H5WasmFS.unlink(BACKING_FILE);
  }
}

export function getFilePath(source: H5WasmSourceType): string {
  if (source instanceof File) {
    return source.name;
  }
  return source;
}

const HDF5_MAGIC_NUMBER = new Uint8Array([137, 72, 68, 70, 13, 10, 26, 10]);

function isHDF5(ab: ArrayBuffer): boolean {
  const uint8_view = new Uint8Array(ab.slice(0, HDF5_MAGIC_NUMBER.byteLength));
  return HDF5_MAGIC_NUMBER.every((m, i) => m === uint8_view[i]);
}

export async function fetchSource(
  source: H5WasmSourceType
): Promise<H5WasmFile> {
  if (source === undefined) {
    throw new Error('source is undefined');
  }
  await H5WasmReady;

  let ab: ArrayBuffer;
  if (source instanceof File) {
    ab = await source.arrayBuffer();
  } else {
    const response = await fetch(source);
    ab = await response.arrayBuffer();
  }
  if (!isHDF5(ab)) {
    throw new Error('Not an HDF5 file');
  }
  unlinkBackingFile();
  H5WasmFS.writeFile(BACKING_FILE, new Uint8Array(ab), { flags: 'w+' });
  return new H5WasmFile(BACKING_FILE, 'r');
}

const sliceExp = /^((?<index_str>\d+)|(?<start_str>\d*):(?<end_str>\d*))$/u;
interface sliceMatchGroup {
  index_str?: string;
  start_str?: string;
  end_str?: string;
}

export function convertSlice(selection: ValuesStoreParams['selection']) {
  if (selection === undefined) {
    return selection;
  }
  const inputSlices = selection.split(',');
  return inputSlices.map((inputSlice) => {
    const match = sliceExp.exec(inputSlice);
    if (match === null) {
      throw new Error(
        `unparseable slice: "${inputSlice}" in selection: "${selection}"`
      );
    }
    const { index_str, start_str, end_str } = match.groups as sliceMatchGroup;

    if (index_str !== undefined) {
      const start = Number.parseInt(index_str, 10);
      return [start, start + 1];
    }
    assertStr(
      start_str,
      'start_str must exist if expression matches and index_str is undefined'
    );
    assertStr(
      end_str,
      'end_str must exist if expression matches and index_str is undefined'
    );
    const start = start_str === '' ? null : Number.parseInt(start_str, 10);
    const end = end_str === '' ? null : Number.parseInt(end_str, 10);
    return [start, end];
  });
}

const dtypeLookups: Record<string, string> = {
  b: 'i1',
  h: 'i2',
  i: 'i4',
  q: 'i8',
  B: 'u1',
  H: 'u2',
  I: 'u4',
  Q: 'u8',
  e: 'f2',
  f: 'f4',
  d: 'f8',
};
const formatExp = /(?<format>[bhiqBHIQefd])/u;

export function convertH5WasmDtype(H5WasmDtype: string): DType {
  const format = formatExp.exec(H5WasmDtype)?.groups?.format;
  const toConvert = format
    ? H5WasmDtype.replace(format, dtypeLookups[format])
    : H5WasmDtype;
  return convertDtype(toConvert);
}
