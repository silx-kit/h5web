import { isNumericType } from '@h5web/shared/guards';
import { H5T_CLASS } from '@h5web/shared/h5t';
import {
  type Attribute,
  type ChildEntity,
  type DType,
  DTypeClass,
  EntityKind,
  type Group,
  type ProvidedEntity,
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
  unknownType,
} from '@h5web/shared/hdf5-utils';
import { type TypedArrayConstructor } from '@h5web/shared/vis-models';

import { typedArrayFromDType } from '../utils';
import {
  type H5GroveAttribute,
  type H5GroveEntity,
  type H5GroveErrorResponse,
  type H5GroveType,
} from './models';

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
  const { name, kind } = h5gEntity;
  const baseEntity = { name, path };

  if (kind === 'group') {
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

  if (h5gEntity.kind === 'dataset') {
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

  if (kind === 'datatype') {
    const { attributes: attrsMetadata, type } = h5gEntity;
    return {
      ...baseEntity,
      kind: EntityKind.Datatype,
      type: parseDType(type),
      rawType: type,
      attributes: parseAttributes(attrsMetadata),
    };
  }

  if (kind === 'soft_link') {
    const { target_path } = h5gEntity;
    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
      attributes: [],
      link: { class: 'Soft', path: target_path },
    };
  }

  if (kind === 'external_link') {
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

export function isH5GroveError(
  payload: unknown,
): payload is H5GroveErrorResponse {
  return (
    !!payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string'
  );
}

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
export function parseDType(type: H5GroveType): DType {
  const { class: h5tClass, size } = type;

  if (h5tClass === H5T_CLASS.INTEGER) {
    return intOrUintType(type.sign, size * 8, type.order);
  }

  if (h5tClass === H5T_CLASS.FLOAT) {
    return floatType(size * 8, type.order);
  }

  if (h5tClass === H5T_CLASS.TIME) {
    return timeType();
  }

  if (h5tClass === H5T_CLASS.STRING) {
    const { cset, strPad, vlen } = type;
    return strType(cset, strPad, vlen ? undefined : size);
  }

  if (h5tClass === H5T_CLASS.BITFIELD) {
    return bitfieldType();
  }

  if (h5tClass === H5T_CLASS.OPAQUE) {
    return opaqueType(type.tag);
  }

  if (h5tClass === H5T_CLASS.COMPOUND) {
    return compoundOrCplxType(
      Object.fromEntries(
        Object.entries(type.members).map(([mName, mType]) => [
          mName,
          parseDType(mType),
        ]),
      ),
    );
  }

  if (h5tClass === H5T_CLASS.REFERENCE) {
    return referenceType();
  }

  if (h5tClass === H5T_CLASS.ENUM) {
    const base = parseDType(type.base);
    if (!isNumericType(base)) {
      throw new Error('Expected enum type to have numeric base type');
    }

    return enumOrBoolType(base, type.members);
  }

  if (h5tClass === H5T_CLASS.VLEN) {
    return arrayType(parseDType(type.base));
  }

  if (h5tClass === H5T_CLASS.ARRAY) {
    return arrayType(parseDType(type.base), type.dims);
  }

  return unknownType();
}
/* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */

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
