import { assertDefined } from '@h5web/shared/guards';
import type {
  Attribute,
  ChildEntity,
  DType,
  Group,
  NumericType,
  ProvidedEntity,
  Shape,
} from '@h5web/shared/hdf5-models';
import { Endianness, EntityKind } from '@h5web/shared/hdf5-models';
import {
  arrayType,
  boolType,
  buildEntityPath,
  compoundType,
  cplxType,
  enumType,
  floatType,
  intType,
  isBoolEnumType,
  strType,
  uintType,
  unknownType,
} from '@h5web/shared/hdf5-utils';
import type { Metadata } from 'h5wasm';
import {
  BrokenSoftLink as H5WasmSoftLink,
  Dataset as H5WasmDataset,
  Datatype as H5WasmDatatype,
  ExternalLink as H5WasmExternalLink,
  Group as H5WasmGroup,
} from 'h5wasm';

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
import type { H5WasmAttributes, H5WasmEntity, NumericMetadata } from './models';

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

export function parseEntity(
  name: string,
  path: string,
  h5wEntity: H5WasmEntity,
  isChild: true,
): ChildEntity;

export function parseEntity(
  name: string,
  path: string,
  h5wEntity: H5WasmEntity,
  isChild?: false,
): ProvidedEntity;

export function parseEntity(
  name: string,
  path: string,
  h5wEntity: H5WasmEntity,
  isChild = false,
): ProvidedEntity | ChildEntity {
  const baseEntity = { name, path };

  if (h5wEntity instanceof H5WasmGroup) {
    const baseGroup: Group = {
      ...baseEntity,
      kind: EntityKind.Group,
      attributes: parseAttributes(h5wEntity.attrs),
    };

    if (isChild) {
      return baseGroup;
    }

    return {
      ...baseGroup,
      children: h5wEntity.keys().map((childName) => {
        const h5wChild = h5wEntity.get(childName);

        const childPath = buildEntityPath(path, childName);
        return parseEntity(childName, childPath, h5wChild, true);
      }),
    };
  }

  if (h5wEntity instanceof H5WasmDataset) {
    const { metadata, filters } = h5wEntity;
    const { chunks, maxshape, shape, ...rawType } = metadata; // keep `rawType` concise

    return {
      ...baseEntity,
      kind: EntityKind.Dataset,
      shape: metadata.shape,
      type: parseDType(metadata),
      chunks: metadata.chunks ?? undefined,
      filters,
      attributes: parseAttributes(h5wEntity.attrs),
      rawType,
    };
  }

  if (h5wEntity instanceof H5WasmSoftLink) {
    return {
      ...baseEntity,
      attributes: [],
      kind: EntityKind.Unresolved,
      link: {
        class: 'Soft',
        path: h5wEntity.target,
      },
    };
  }

  if (h5wEntity instanceof H5WasmExternalLink) {
    return {
      ...baseEntity,
      attributes: [],
      kind: EntityKind.Unresolved,
      link: {
        class: 'External',
        path: h5wEntity.obj_path,
        file: h5wEntity.filename,
      },
    };
  }

  return {
    ...baseEntity,
    attributes: [],
    kind:
      h5wEntity instanceof H5WasmDatatype
        ? EntityKind.Datatype
        : EntityKind.Unresolved,
  };
}

function parseAttributes(h5wAttrs: H5WasmAttributes): Attribute[] {
  return Object.entries(h5wAttrs).map(([name, attr]) => {
    const { shape, metadata } = attr;
    return {
      name,
      shape: shape as Shape,
      type: parseDType(metadata),
    };
  });
}

export function parseDTypeFromNumericMetadata(
  metadata: NumericMetadata,
): NumericType {
  const { signed, size: length, littleEndian } = metadata;
  const size = length * 8;
  const endianness = littleEndian ? Endianness.LE : Endianness.BE;

  if (isIntegerMetadata(metadata)) {
    return signed ? intType(size, endianness) : uintType(size, endianness);
  }

  if (isFloatMetadata(metadata)) {
    return floatType(size, endianness);
  }

  throw new Error('Expected numeric metadata');
}

export function parseDType(metadata: Metadata): DType {
  if (isNumericMetadata(metadata)) {
    return parseDTypeFromNumericMetadata(metadata);
  }

  if (isStringMetadata(metadata)) {
    const { size, cset, vlen } = metadata;

    return strType(
      cset === 1 ? 'UTF-8' : 'ASCII',
      // For variable-length string datatypes, the returned value is the size of the pointer to the actual string and
      // not the size of actual variable-length string data (https://portal.hdfgroup.org/display/HDF5/H5T_GET_SIZE)
      vlen ? undefined : size,
    );
  }

  if (isArrayMetadata(metadata)) {
    const { array_type } = metadata;
    assertDefined(array_type);

    return arrayType(parseDType(array_type), array_type.shape);
  }

  if (isCompoundMetadata(metadata)) {
    const { compound_type } = metadata;
    const { members, nmembers } = compound_type;

    if (nmembers === 2 && members[0].name === 'r' && members[1].name === 'i') {
      const [realTypeMetadata, imagTypeMetadata] = members;
      assertNumericMetadata(realTypeMetadata);
      assertNumericMetadata(imagTypeMetadata);

      return cplxType(
        parseDTypeFromNumericMetadata(realTypeMetadata),
        parseDTypeFromNumericMetadata(imagTypeMetadata),
      );
    }

    return compoundType(
      Object.fromEntries(
        members.map((member) => [member.name, parseDType(member)]),
      ),
    );
  }

  if (isEnumMetadata(metadata)) {
    const { enum_type } = metadata;
    const { members: mapping, type: baseType } = enum_type;

    const baseMetadata = { ...metadata, type: baseType };
    assertNumericMetadata(baseMetadata);

    const type = enumType(parseDTypeFromNumericMetadata(baseMetadata), mapping);
    return isBoolEnumType(type) ? boolType() : type; // booleans stored as enums by h5py
  }

  return unknownType();
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
