import { assertDefined } from '@h5web/shared/guards';
import type { DType, NumericType } from '@h5web/shared/models-hdf5';
import { DTypeClass, Endianness } from '@h5web/shared/models-hdf5';
import type { Dataset as H5WasmDataset, Metadata } from 'h5wasm';

import {
  assertNumericMetadata,
  isArrayMetadata,
  isCompoundMetadata,
  isEnumMetadata,
  isFloatMetadata,
  isIntegerMetadata,
  isNumericMetadata,
  isStringMetadata,
} from './guards';
import type { NumericMetadata } from './models';

// https://github.com/h5wasm/h5wasm-plugins#included-plugins
// https://support.hdfgroup.org/services/contributions.html
export const PLUGINS_BY_FILTER_ID: Record<number, string> = {
  307: 'bz2',
  32_000: 'lzf',
  32_001: 'blosc',
  32_004: 'lz4',
  32_013: 'zfp',
  32_015: 'zstd',
  32_017: 'szf',
};

export function convertNumericMetadataToDType(
  metadata: NumericMetadata,
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
    const { size, cset, vlen } = metadata;

    return {
      class: DTypeClass.String,
      // For variable-length string datatypes, the returned value is the size of the pointer to the actual string and
      // not the size of actual variable-length string data (https://portal.hdfgroup.org/display/HDF5/H5T_GET_SIZE)
      length: vlen ? undefined : size,
      charSet: cset === 1 ? 'UTF-8' : 'ASCII',
    };
  }

  if (isArrayMetadata(metadata)) {
    const { array_type } = metadata;
    assertDefined(array_type);

    return {
      class: DTypeClass.Array,
      base: convertMetadataToDType(array_type),
      dims: array_type.shape,
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
        members.map((member) => [member.name, convertMetadataToDType(member)]),
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
  selection: string,
): [number, number][] {
  const { shape } = dataset;
  const selectionMembers = selection.split(',');

  return selectionMembers.map((member, i) => {
    if (member === ':') {
      return [0, shape[i]];
    }

    return [Number(member), Number(member) + 1];
  });
}
