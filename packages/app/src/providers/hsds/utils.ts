import { isGroup } from '@h5web/shared/guards';
import { H5T_CSET, H5T_ORDER, H5T_STR } from '@h5web/shared/h5t';
import {
  type ArrayShape,
  type Attribute,
  type BooleanType,
  type ChildEntity,
  type Dataset,
  type DType,
  type Entity,
  EntityKind,
  type EnumType,
  type Group,
  type Link,
  type NumericType,
  type ScalarShape,
  type Shape,
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
  type HsdsNumericType,
  type HsdsShape,
  type HsdsSymbolicLink,
  type HsdsType,
} from './models';

export function isHsdsGroup(entity: HsdsEntity): entity is HsdsEntity<Group> {
  return isGroup(entity);
}

export function assertHsdsEntity<T extends Entity>(
  entity: T,
): asserts entity is HsdsEntity<T> {
  if (!('id' in entity) || !('collection' in entity)) {
    throw new Error('Expected entity to be HSDS entity');
  }
}

export function assertHsdsDataset(
  dataset: Dataset<ScalarShape | ArrayShape>,
): asserts dataset is HsdsEntity<Dataset<ScalarShape | ArrayShape>> {
  assertHsdsEntity(dataset);

  if (dataset.collection !== 'datasets') {
    throw new Error('Expected entity to be HSDS dataset');
  }
}

function assertHsdsNumericType(
  type: HsdsType,
): asserts type is HsdsNumericType {
  if (type.class !== 'H5T_INTEGER' && type.class !== 'H5T_FLOAT') {
    throw new Error('Expected HSDS numeric type');
  }
}

export function convertHsdsEntity<R extends HsdsEntityResponse>(
  path: string,
  response: R,
): HsdsEntityFromResponse<R>;

export function convertHsdsEntity<R extends HsdsEntityResponse>(
  path: string,
  response: R,
): HsdsEntity<ChildEntity> {
  const { id, class: kind, attributes: hsdsAttributes } = response;

  const name = path.slice(path.lastIndexOf('/') + 1);
  const attributes = convertHsdsAttributes(hsdsAttributes);

  switch (kind) {
    case 'group':
      return {
        id,
        collection: 'groups',
        name,
        path,
        kind: EntityKind.Group,
        attributes,
      };

    case 'dataset': {
      const { shape, type } = response;
      return {
        id,
        collection: 'datasets',
        name,
        path,
        kind: EntityKind.Dataset,
        attributes,
        shape: convertHsdsShape(shape),
        type: convertHsdsType(type),
        rawType: type,
      };
    }
    case 'datatype': {
      const { type } = response;
      return {
        id,
        collection: 'datatypes',
        name,
        path,
        kind: EntityKind.Datatype,
        attributes,
        type: convertHsdsType(type),
        rawType: type,
      };
    }
    default:
      throw new Error('Unknown entity class');
  }
}

export function convertHsdsSymbolicLink(hsdsLink: HsdsSymbolicLink): Link {
  const { h5path, file, class: linkClass } = hsdsLink;
  return {
    class: linkClass === 'H5L_TYPE_SOFT' ? 'Soft' : 'External',
    path: h5path,
    file,
  };
}

export function convertHsdsShape(shape: HsdsShape): Shape {
  const { class: shapeClass } = shape;

  if (shapeClass === 'H5S_SIMPLE') {
    return arrayShape(shape.dims);
  }

  if (shapeClass === 'H5S_SCALAR') {
    return scalarShape();
  }

  return nullShape();
}

function convertHsdsNumericType(hsdsType: HsdsNumericType): NumericType {
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

function convertHsdsEnumType(hsdsType: HsdsEnumType): EnumType | BooleanType {
  const { base, members } = hsdsType;
  assertHsdsNumericType(base);

  return enumOrBoolType(
    convertHsdsNumericType(base),
    Object.fromEntries(members.map(({ name, value }) => [name, value])),
  );
}

export function convertHsdsType(hsdsType: HsdsType): DType {
  switch (hsdsType.class) {
    case 'H5T_INTEGER':
    case 'H5T_FLOAT':
      return convertHsdsNumericType(hsdsType);

    case 'H5T_COMPOUND':
      return compoundOrCplxType(
        hsdsType.fields.map((v) => [v.name, convertHsdsType(v.type)]),
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
      return vlenType(convertHsdsType(hsdsType.base));

    case 'H5T_ARRAY':
      return arrayType(convertHsdsType(hsdsType.base), hsdsType.dims);

    case 'H5T_ENUM':
      return convertHsdsEnumType(hsdsType);

    case 'H5T_REFERENCE':
      return referenceType();

    case 'H5T_OPAQUE':
      return opaqueType();

    default:
      return unknownType();
  }
}

export function convertHsdsAttributes(attrs: HsdsAttribute[]): Attribute[] {
  return Object.entries(attrs).map(([name, attr]) => ({
    name,
    shape: convertHsdsShape(attr.shape),
    type: convertHsdsType(attr.type),
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
