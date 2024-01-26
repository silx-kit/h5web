import type {
  Attribute,
  ChildEntity,
  DType,
  Group,
  ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { Endianness, EntityKind } from '@h5web/shared/hdf5-models';
import {
  boolType,
  buildEntityPath,
  compoundType,
  cplxType,
  floatType,
  intType,
  strType,
  uintType,
  unknownType,
} from '@h5web/shared/hdf5-utils';

import type { H5GroveAttribute, H5GroveDtype, H5GroveEntity } from './models';

export function parseEntity(
  path: string,
  h5gEntity: H5GroveEntity,
  isChild: true,
): ChildEntity;

export function parseEntity(
  path: string,
  h5gEntity: H5GroveEntity,
  isChild?: false,
): ProvidedEntity;

export function parseEntity(
  path: string,
  h5gEntity: H5GroveEntity,
  isChild = false,
): ProvidedEntity | ChildEntity {
  const { name } = h5gEntity;
  const baseEntity = { name, path };

  if (h5gEntity.type === EntityKind.Group) {
    const { children = [], attributes: attrsMetadata } = h5gEntity;
    const attributes = parseAttributes(attrsMetadata);
    const baseGroup: Group = {
      ...baseEntity,
      kind: EntityKind.Group,
      attributes,
    };

    if (isChild) {
      return baseGroup;
    }

    return {
      ...baseGroup,
      children: children.map((child) => {
        const childPath = buildEntityPath(path, child.name);
        return parseEntity(childPath, child, true);
      }),
    };
  }

  if (h5gEntity.type === EntityKind.Dataset) {
    const {
      attributes: attrsMetadata,
      dtype,
      shape,
      chunks,
      filters,
    } = h5gEntity;
    return {
      ...baseEntity,
      kind: EntityKind.Dataset,
      shape,
      type: parseDType(dtype),
      rawType: dtype,
      ...(chunks && { chunks }),
      ...(filters && { filters }),
      attributes: parseAttributes(attrsMetadata),
    };
  }

  if (h5gEntity.type === 'soft_link') {
    const { target_path } = h5gEntity;
    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
      attributes: [],
      link: { class: 'Soft', path: target_path },
    };
  }

  if (h5gEntity.type === 'external_link') {
    const { target_file, target_path } = h5gEntity;
    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
      attributes: [],
      link: {
        class: 'External',
        file: target_file,
        path: target_path,
      },
    };
  }

  // Treat other entities as unresolved
  return {
    ...baseEntity,
    kind: EntityKind.Unresolved,
    attributes: [],
  };
}

function parseAttributes(attrsMetadata: H5GroveAttribute[]): Attribute[] {
  return attrsMetadata.map<Attribute>(({ name, dtype, shape }) => ({
    name,
    shape,
    type: parseDType(dtype),
  }));
}

// https://numpy.org/doc/stable/reference/generated/numpy.dtype.byteorder.html#numpy.dtype.byteorder
const ENDIANNESS_MAPPING: Record<string, Endianness> = {
  '<': Endianness.LE,
  '>': Endianness.BE,
};

export function parseDType(dtype: H5GroveDtype): DType {
  if (typeof dtype === 'string') {
    return parseDTypeFromString(dtype);
  }

  return compoundType(
    Object.fromEntries(
      Object.entries(dtype).map(([k, v]) => [k, parseDType(v)]),
    ),
  );
}

function parseDTypeFromString(dtype: string): DType {
  const regexp = /([<>=|])?([A-Za-z])(\d*)/u;
  const matches = regexp.exec(dtype);

  if (matches === null) {
    throw new Error(`Invalid dtype string: ${dtype}`);
  }

  const [, endianMatch, dataType, lengthMatch] = matches;

  const length = lengthMatch ? Number.parseInt(lengthMatch, 10) : 0;
  const endianness = ENDIANNESS_MAPPING[endianMatch] || undefined;

  switch (dataType) {
    case 'b':
      // Booleans are stored as bytes but numpy represents them distinctly from "normal" bytes:
      // `|b1` for booleans vs. `|i1` for normal bytes
      // https://numpy.org/doc/stable/reference/arrays.scalars.html#numpy.bool
      return boolType();

    case 'f':
      return floatType(length * 8, endianness);

    case 'i':
      return intType(length * 8, endianness);

    case 'u':
      return uintType(length * 8, endianness);

    case 'c':
      return cplxType(
        floatType(
          (length / 2) * 8, // bytes are equally distributed between real and imag
          endianness,
        ),
      );

    case 'S':
      return strType('ASCII', length);

    case 'O':
      return strType('UTF-8');

    default:
      return unknownType();
  }
}

export function hasErrorMessage(error: unknown): error is { message: string } {
  return !!error && typeof error === 'object' && 'message' in error;
}
