import { isGroup } from '@h5web/shared/guards';
import { H5T_CSET, H5T_ORDER, H5T_STR } from '@h5web/shared/h5t';
import {
  type ArrayShape,
  type Attribute,
  type BooleanType,
  type Dataset,
  type DType,
  type Entity,
  type EnumType,
  type Group,
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
  type HsdsEnumType,
  type HsdsNumericType,
  type HsdsShape,
  type HsdsType,
} from './models';

export function isHsdsGroup(entity: HsdsEntity): entity is HsdsEntity<Group> {
  return isGroup(entity);
}

export function assertHsdsEntity<T extends Entity>(
  entity: T,
): asserts entity is HsdsEntity<T> {
  if (!('id' in entity)) {
    throw new Error('Expected entity to be HSDS entity');
  }
}

export function assertHsdsDataset(
  dataset: Dataset<ScalarShape | ArrayShape>,
): asserts dataset is HsdsEntity<Dataset<ScalarShape | ArrayShape>> {
  if (!('id' in dataset)) {
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

export function parseShape(shape: HsdsShape): Shape {
  const { class: shapeClass } = shape;

  if (shapeClass === 'H5S_SIMPLE') {
    return arrayShape(shape.dims);
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

export function parseAttributes(attrs: HsdsAttribute[]): Attribute[] {
  return attrs.map((attr) => ({
    name: attr.name,
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
