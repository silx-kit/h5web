import type { DType, NumericType } from '@h5web/shared';
import { DTypeClass, Endianness } from '@h5web/shared';
import type { Dataset as H5WasmDataset, Metadata } from 'h5wasm';

import {
  assertNumericMetadata,
  isCompoundMetadata,
  isEnumMetadata,
  isFloatMetadata,
  isIntegerMetadata,
  isNumericMetadata,
  isStringMetadata,
} from './guards';
import type { NumericMetadata } from './models';

// https://www.loc.gov/preservation/digital/formats/fdd/fdd000229.shtml
const HDF5_MAGIC_NUMBER = [0x89, 0x48, 0x44, 0x46, 0x0d, 0x0a, 0x1a, 0x0a]; // ASCII: \211 HDF \r \n \032 \n

export function isHDF5(buffer: ArrayBuffer): boolean {
  return new Uint8Array(buffer.slice(0, HDF5_MAGIC_NUMBER.length)).every(
    (num, i) => num === HDF5_MAGIC_NUMBER[i]
  );
}

export function convertNumericMetadataToDType(
  metadata: NumericMetadata
): NumericType {
  if (isIntegerMetadata(metadata)) {
    const { signed, size: length, littleEndian } = metadata;

    return {
      class: signed ? DTypeClass.Integer : DTypeClass.Unsigned,
      size: length * 8,
      endianness: littleEndian ? Endianness.LE : Endianness.BE,
    };
  }

  if (isFloatMetadata(metadata)) {
    const { size: length, littleEndian } = metadata;

    return {
      class: DTypeClass.Float,
      size: length * 8,
      endianness: littleEndian ? Endianness.LE : Endianness.BE,
    };
  }

  throw new Error('Expected numeric metadata');
}

export function convertMetadataToDType(metadata: Metadata): DType {
  if (isNumericMetadata(metadata)) {
    return convertNumericMetadataToDType(metadata);
  }

  if (isStringMetadata(metadata)) {
    const { size: length, cset } = metadata;

    return {
      class: DTypeClass.String,
      length,
      charSet: cset === 1 ? 'UTF-8' : 'ASCII',
    };
  }

  if (isCompoundMetadata(metadata)) {
    const { compound_type } = metadata;
    const { members, nmembers } = compound_type;

    if (nmembers === 2 && members[0].name === 'r' && members[1].name === 'i') {
      const [realTypeMetadata, imagTypeMetadata] = members;
      assertNumericMetadata(realTypeMetadata);
      assertNumericMetadata(imagTypeMetadata);

      return {
        class: DTypeClass.Complex,
        realType: convertNumericMetadataToDType(realTypeMetadata),
        imagType: convertNumericMetadataToDType(imagTypeMetadata),
      };
    }

    return {
      class: DTypeClass.Compound,
      fields: Object.fromEntries(
        members.map((member) => [member.name, convertMetadataToDType(member)])
      ),
    };
  }

  if (isEnumMetadata(metadata)) {
    const { enum_type } = metadata;
    const { members: mapping, type } = enum_type;

    const mappingKeys = Object.keys(mapping);

    if (mappingKeys.includes('FALSE') && mappingKeys.includes('TRUE')) {
      return {
        class: DTypeClass.Bool,
      };
    }

    return {
      class: DTypeClass.Enum,
      mapping,
      base: convertMetadataToDType({ ...metadata, type }),
    };
  }

  return {
    class: DTypeClass.Unknown,
  };
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
