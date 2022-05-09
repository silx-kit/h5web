import type { DType } from '@h5web/shared';
import { DTypeClass, Endianness } from '@h5web/shared';
import {
  BrokenSoftLink as H5WasmSoftLink,
  Dataset as H5WasmDataset,
  ExternalLink as H5WasmExternalLink,
  Group as H5WasmGroup,
} from 'h5wasm';
import type { Metadata } from 'h5wasm/src/hdf5_util_helpers';

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

export function isH5WasmSoftLink(
  entity: H5WasmEntity
): entity is H5WasmSoftLink {
  return entity instanceof H5WasmSoftLink;
}

export function isH5WasmExternalLink(
  entity: H5WasmEntity
): entity is H5WasmExternalLink {
  return entity instanceof H5WasmExternalLink;
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

export function convertMetadataToDType(metadata: Metadata): DType {
  const { signed, type, size: length, littleEndian } = metadata;

  // See H5T_class_t in https://github.com/usnistgov/h5wasm/blob/main/src/hdf5_util_helpers.d.ts
  switch (type) {
    case 0:
      return {
        class: signed ? DTypeClass.Integer : DTypeClass.Unsigned,
        size: length * 8,
        endianness: littleEndian ? Endianness.LE : Endianness.BE,
      };

    case 1:
      return {
        class: DTypeClass.Float,
        size: length * 8,
        endianness: littleEndian ? Endianness.LE : Endianness.BE,
      };

    case 3:
      return {
        class: DTypeClass.String,
        length,
        charSet: metadata.cset === 1 ? 'UTF-8' : 'ASCII',
      };

    default:
      return {
        class: DTypeClass.Unknown,
      };
  }
}

export function convertSelectionToRanges(
  dataset: H5WasmDataset,
  selection: string
): number[][] {
  const { shape } = dataset;
  const selectionMembers = selection.split(',');

  return selectionMembers.map((member, i) => {
    if (member === ':') {
      return [0, shape[i]];
    }

    return [Number(member), Number(member) + 1];
  });
}
