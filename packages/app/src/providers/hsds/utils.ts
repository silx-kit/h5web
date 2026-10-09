import { H5T_CSET, H5T_ORDER, H5T_STR } from '@h5web/shared/h5t';
import {
  type Attribute,
  type BooleanType,
  type ChildEntity,
  type DType,
  type Entity,
  EntityKind,
  type EnumType,
  type Link,
  type NumericType,
  type Shape,
  type UnresolvedEntity,
} from '@h5web/shared/hdf5-models';
import {
  arrayShape,
  arrayType,
  compoundOrCplxType,
  enumOrBoolType,
  floatType,
  intType,
  nullShape,
  opaqueType,
  referenceType,
  scalarShape,
  strType,
  unknownType,
  vlenType,
} from '@h5web/shared/hdf5-utils';

import {
  type HsdsAttribute,
  type HsdsEntity,
  type HsdsEntityFromResponse,
  type HsdsEntityResponse,
  type HsdsEnumType,
  type HsdsLink,
  type HsdsNumericType,
  type HsdsShape,
  type HsdsType,
} from './models';

export function assertHsdsEntity<T extends Entity>(
  entity: T,
): asserts entity is HsdsEntity<T> {
  if (!('id' in entity) || !('domain' in entity)) {
    throw new Error('Expected entity to be HSDS entity');
  }
}

function assertHsdsNumericType(
  type: HsdsType,
): asserts type is HsdsNumericType {
  if (type.class !== 'H5T_INTEGER' && type.class !== 'H5T_FLOAT') {
    throw new Error('Expected HSDS numeric type');
  }
}

export function parseEntity<R extends HsdsEntityResponse>(
  path: string,
  response: R,
  hsdsLink?: HsdsLink,
): HsdsEntityFromResponse<R>;

export function parseEntity(
  path: string,
  response: HsdsEntityResponse | undefined,
  hsdsLink?: HsdsLink,
): HsdsEntity<ChildEntity> | UnresolvedEntity;

export function parseEntity(
  path: string,
  response: HsdsEntityResponse | undefined,
  hsdsLink?: HsdsLink,
): HsdsEntity<ChildEntity> | UnresolvedEntity {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const link = hsdsLink && parseLink(hsdsLink);

  if (!response) {
    return {
      name,
      path,
      kind: EntityKind.Unresolved as const,
      attributes: [],
      link,
    };
  }

  const { id, domain, class: kind, attributes: hsdsAttributes } = response;
  const baseEntity = {
    id,
    domain,
    name,
    path,
    attributes: parseAttributes(hsdsAttributes),
    ...(link && { link }),
  };

  switch (kind) {
    case 'group':
      return {
        ...baseEntity,
        kind: EntityKind.Group,
      };

    case 'dataset': {
      const { shape, type } = response;
      return {
        ...baseEntity,
        kind: EntityKind.Dataset,
        shape: parseShape(shape),
        type: parseType(type),
        rawType: type,
      };
    }
    case 'datatype': {
      const { type } = response;
      return {
        ...baseEntity,
        kind: EntityKind.Datatype,
        type: parseType(type),
        rawType: type,
      };
    }
    default:
      throw new Error('Unknown entity class');
  }
}

function parseLink(hsdsLink: HsdsLink): Link {
  const { class: linkClass } = hsdsLink;

  if (linkClass === 'H5L_TYPE_HARD') {
    return { class: 'Hard' };
  }

  if (linkClass === 'H5L_TYPE_SOFT') {
    return { class: 'Soft', path: hsdsLink.h5path };
  }

  return { class: 'External', file: hsdsLink.h5domain, path: hsdsLink.h5path };
}

function parseShape(hsdsShape: HsdsShape): Shape {
  const { class: shapeClass } = hsdsShape;

  if (shapeClass === 'H5S_SIMPLE') {
    return arrayShape(hsdsShape.dims);
  }

  if (shapeClass === 'H5S_SCALAR') {
    return scalarShape();
  }

  return nullShape();
}

function parseNumericType(hsdsType: HsdsNumericType): NumericType {
  const { class: hsdsClass, base } = hsdsType;

  const regex = /H5T_(?:IEEE|STD)_([A-Z])(\d+)(BE|LE)/u;
  const matches = regex.exec(base);

  if (!matches) {
    throw new Error(`Unrecognized base ${base}`);
  }

  const [, sign, sizeStr, h5tOrderStr] = matches;
  const size = Number.parseInt(sizeStr);
  const h5tOrder = H5T_ORDER[h5tOrderStr as keyof typeof H5T_ORDER];

  if (hsdsClass === 'H5T_FLOAT') {
    return floatType(size, h5tOrder);
  }

  return intType(sign === 'I', size, h5tOrder);
}

function parseEnumType(hsdsType: HsdsEnumType): EnumType | BooleanType {
  const { base, members } = hsdsType;
  assertHsdsNumericType(base);

  return enumOrBoolType(
    parseNumericType(base),
    Object.fromEntries(members.map(({ name, value }) => [name, value])),
  );
}

export function parseType(hsdsType: HsdsType): DType {
  switch (hsdsType.class) {
    case 'H5T_INTEGER':
    case 'H5T_FLOAT':
      return parseNumericType(hsdsType);

    case 'H5T_COMPOUND':
      return compoundOrCplxType(
        hsdsType.fields.map((v) => [v.name, parseType(v.type)]),
      );

    case 'H5T_STRING': {
      const { charSet, strPad, length } = hsdsType;
      return strType(
        H5T_CSET[
          charSet.slice(charSet.lastIndexOf('_') + 1) as keyof typeof H5T_CSET
        ],
        H5T_STR[
          strPad.slice(strPad.lastIndexOf('_') + 1) as keyof typeof H5T_STR
        ],
        length === 'H5T_VARIABLE' ? undefined : length,
      );
    }

    case 'H5T_VLEN':
      return vlenType(parseType(hsdsType.base));

    case 'H5T_ARRAY':
      return arrayType(parseType(hsdsType.base), hsdsType.dims);

    case 'H5T_ENUM':
      return parseEnumType(hsdsType);

    case 'H5T_REFERENCE':
      return referenceType();

    case 'H5T_OPAQUE':
      return opaqueType();

    default:
      return unknownType();
  }
}

function parseAttributes(attrs: HsdsAttribute[]): Attribute[] {
  return Object.entries(attrs).map(([name, attr]) => ({
    name,
    shape: parseShape(attr.shape),
    type: parseType(attr.type),
  }));
}

export function toExtendedJSON(buffer: ArrayBuffer): unknown {
  const str = new TextDecoder().decode(buffer);

  try {
    return JSON.parse(str);
  } catch {
    try {
      // Convert Infinity/NaN to JSON strings and try again
      // https://github.com/HDFGroup/hsds/issues/87
      return JSON.parse(str.replaceAll(/-?Infinity|NaN/gu, '"$&"'));
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new TypeError('Expected valid JSON', { cause: error });
      }
      throw error;
    }
  }
}
