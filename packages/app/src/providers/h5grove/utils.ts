import { isNumericType } from '@h5web/shared/guards';
import type {
  Attribute,
  ChildEntity,
  DType,
  Group,
  ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import {
  DTypeClass,
  EntityKind,
  H5TClass,
  H5TSign,
} from '@h5web/shared/hdf5-models';
import {
  arrayType,
  bitfieldType,
  buildEntityPath,
  compoundOrCplxType,
  enumOrBoolType,
  floatType,
  intOrUintType,
  opaqueType,
  referenceType,
  strType,
  timeType,
  toCharSet,
  toEndianness,
  unknownType,
} from '@h5web/shared/hdf5-utils';
import type { TypedArrayConstructor } from '@h5web/shared/vis-models';

import { typedArrayFromDType } from '../utils';
import type { H5GroveAttribute, H5GroveEntity, H5GroveType } from './models';

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

  if (h5gEntity.kind === EntityKind.Group) {
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

  if (h5gEntity.kind === EntityKind.Dataset) {
    const {
      attributes: attrsMetadata,
      type,
      shape,
      chunks,
      filters,
    } = h5gEntity;
    return {
      ...baseEntity,
      kind: EntityKind.Dataset,
      shape,
      type: parseDType(type),
      rawType: type,
      ...(chunks && { chunks }),
      ...(filters && { filters }),
      attributes: parseAttributes(attrsMetadata),
    };
  }

  if (h5gEntity.kind === 'soft_link') {
    const { target_path } = h5gEntity;
    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
      attributes: [],
      link: { class: 'Soft', path: target_path },
    };
  }

  if (h5gEntity.kind === 'external_link') {
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
  return attrsMetadata.map<Attribute>(({ name, type: dtype, shape }) => ({
    name,
    shape,
    type: parseDType(dtype),
  }));
}

export function hasErrorMessage(error: unknown): error is { message: string } {
  return !!error && typeof error === 'object' && 'message' in error;
}

export function parseDType(type: H5GroveType): DType {
  const { class: h5tClass, size } = type;

  if (h5tClass === H5TClass.Integer) {
    return intOrUintType(
      type.sign === H5TSign.Signed,
      size * 8,
      toEndianness(type.order),
    );
  }

  if (h5tClass === H5TClass.Float) {
    return floatType(size * 8, toEndianness(type.order));
  }

  if (h5tClass === H5TClass.Time) {
    return timeType();
  }

  if (h5tClass === H5TClass.String) {
    const { cset, vlen } = type;
    return strType(toCharSet(cset), vlen ? undefined : size);
  }

  if (h5tClass === H5TClass.Bitfield) {
    return bitfieldType();
  }

  if (h5tClass === H5TClass.Opaque) {
    return opaqueType(type.tag);
  }

  if (h5tClass === H5TClass.Compound) {
    return compoundOrCplxType(
      Object.fromEntries(
        Object.entries(type.members).map(([mName, mType]) => [
          mName,
          parseDType(mType),
        ]),
      ),
    );
  }

  if (h5tClass === H5TClass.Reference) {
    return referenceType();
  }

  if (h5tClass === H5TClass.Enum) {
    const base = parseDType(type.base);
    if (!isNumericType(base)) {
      throw new Error('Expected enum type to have numeric base type');
    }

    return enumOrBoolType(base, type.members);
  }

  if (h5tClass === H5TClass.Vlen) {
    return arrayType(parseDType(type.base));
  }

  if (h5tClass === H5TClass.Array) {
    return arrayType(parseDType(type.base), type.dims);
  }

  return unknownType();
}

/*
 * Take advantage of h5grove's "safe" dtype conversions (i.e. `dtype=safe`)
 * to allow fetching more data as binary.
 * https://github.com/silx-kit/h5grove/blob/3c851e748d52f5bb8eab12a7f8368781b86772da/h5grove/utils.py#L196
 */
export function h5groveTypedArrayFromDType(
  dtype: DType,
): TypedArrayConstructor | undefined {
  const { class: dtypeClass } = dtype;

  if (dtypeClass === DTypeClass.Float && dtype.size === 16) {
    return Float32Array; // also saves a number[]->Float32Array conversion in texture-based visualizations
  }

  if (dtypeClass === DTypeClass.Float && dtype.size === 128) {
    return Float64Array;
  }

  return typedArrayFromDType(dtype);
}
