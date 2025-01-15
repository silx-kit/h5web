import { assertArray, isGroup } from '@h5web/shared/guards';
import { H5T_CSET, H5T_ORDER, H5T_STR } from '@h5web/shared/h5t';
import {
  type ArrayShape,
  type Attribute,
  type BooleanType,
  type ComplexType,
  type CompoundType,
  type Dataset,
  type DType,
  DTypeClass,
  type Entity,
  type EnumType,
  type Group,
  type NumericType,
  type ScalarShape,
  type Shape,
} from '@h5web/shared/hdf5-models';
import {
  compoundType,
  cplxType,
  enumOrBoolType,
  floatType,
  intType,
  strType,
  uintType,
  unknownType,
} from '@h5web/shared/hdf5-utils';

import {
  type HsdsAttribute,
  type HsdsCompoundType,
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

export function convertHsdsShape(shape: HsdsShape): Shape {
  const { class: shapeClass, dims } = shape;
  return dims || (shapeClass === 'H5S_SCALAR' ? [] : null);
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

  if (sign === 'U') {
    return uintType(size, h5tOrder);
  }

  return intType(size, h5tOrder);
}

function convertHsdsCompoundType(
  hsdsType: HsdsCompoundType,
): CompoundType | ComplexType {
  const { fields } = hsdsType;

  if (fields.length === 2 && fields[0].name === 'r' && fields[1].name === 'i') {
    const [{ type: realType }, { type: imagType }] = fields;
    assertHsdsNumericType(realType);
    assertHsdsNumericType(imagType);

    return cplxType(
      convertHsdsNumericType(realType),
      convertHsdsNumericType(imagType),
    );
  }

  return compoundType(
    Object.fromEntries(fields.map((v) => [v.name, convertHsdsType(v.type)])),
  );
}

function convertHsdsEnumType(hsdsType: HsdsEnumType): EnumType | BooleanType {
  const { base, mapping } = hsdsType;
  assertHsdsNumericType(base);
  return enumOrBoolType(convertHsdsNumericType(base), mapping);
}

export function convertHsdsType(hsdsType: HsdsType): DType {
  switch (hsdsType.class) {
    case 'H5T_INTEGER':
    case 'H5T_FLOAT':
      return convertHsdsNumericType(hsdsType);

    case 'H5T_COMPOUND':
      return convertHsdsCompoundType(hsdsType);

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

    case 'H5T_ARRAY':
    case 'H5T_VLEN':
      return {
        class:
          hsdsType.class === 'H5T_ARRAY' ? DTypeClass.Array : DTypeClass.VLen,
        base: convertHsdsType(hsdsType.base),
        ...(hsdsType.dims && { dims: hsdsType.dims }),
      };

    case 'H5T_ENUM':
      return convertHsdsEnumType(hsdsType);

    default:
      return unknownType();
  }
}

export function convertHsdsAttributes(attrs: HsdsAttribute[]): Attribute[] {
  return attrs.map((attr) => ({
    name: attr.name,
    shape: convertHsdsShape(attr.shape),
    type: convertHsdsType(attr.type),
  }));
}

export function flattenValue(
  value: unknown,
  dataset: Dataset<ArrayShape>,
  selection?: string,
): unknown[] {
  assertArray(value);
  const slicedDims = selection?.split(',').filter((s) => s.includes(':'));
  const dims = slicedDims || dataset.shape;
  return value.flat(dims.length - 1);
}
