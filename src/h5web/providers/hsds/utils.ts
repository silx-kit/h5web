import { isDataset, isGroup } from '../../guards';
import {
  ComplexType,
  CompoundType,
  Endianness,
  DType,
  DTypeClass,
  NumericType,
  Entity,
  Shape,
  Attribute,
  Group,
  Dataset,
} from '../models';
import type {
  HsdsType,
  HsdsEntity,
  HsdsAttributeResponse,
  HsdsShape,
  HsdsNumericType,
  HsdsCompoundType,
} from './models';

export function isHsdsGroup(entity: HsdsEntity): entity is HsdsEntity<Group> {
  return isGroup(entity);
}

function isHsdsDataset(entity: HsdsEntity): entity is HsdsEntity<Dataset> {
  return isDataset(entity);
}

export function assertHsdsEntity(entity: Entity): asserts entity is HsdsEntity {
  if (!('id' in entity)) {
    throw new Error('Expected entity to be HSDS entity');
  }
}

export function assertHsdsDataset(
  entity: HsdsEntity
): asserts entity is HsdsEntity<Dataset> {
  if (!isHsdsDataset(entity)) {
    throw new Error('Expected entity to be HSDS dataset');
  }
}

export function convertHsdsShape(shape: HsdsShape): Shape {
  const { class: shapeClass, dims } = shape;
  return dims || (shapeClass === 'H5S_SCALAR' ? [] : null);
}

function convertHsdsNumericType(hsdsType: HsdsNumericType): NumericType {
  const { class: hsdsClass, base } = hsdsType;

  const regex = /H5T_(?:STD|IEEE)_([A-Z])(\d+)(BE|LE)/u;
  const matches = regex.exec(base);

  if (!matches) {
    throw new Error(`Unrecognized base ${base}`);
  }

  const [, sign, size, endianness] = matches;

  return {
    class:
      hsdsClass === 'H5T_FLOAT'
        ? DTypeClass.Float
        : sign === 'U'
        ? DTypeClass.Unsigned
        : DTypeClass.Integer,
    endianness: Endianness[endianness as 'BE' | 'LE'],
    size: Number.parseInt(size, 10),
  };
}

function convertHsdsCompoundType(
  hsdsType: HsdsCompoundType
): CompoundType | ComplexType {
  const { fields } = hsdsType;

  if (fields.length === 2 && fields[0].name === 'r' && fields[1].name === 'i') {
    return {
      class: DTypeClass.Complex,
      realType: convertHsdsType(fields[0].type),
      imagType: convertHsdsType(fields[1].type),
    };
  }

  return {
    class: DTypeClass.Compound,
    fields: Object.fromEntries(
      hsdsType.fields.map((v) => [v.name, convertHsdsType(v.type)])
    ),
  };
}

export function convertHsdsType(hsdsType: HsdsType): DType {
  switch (hsdsType.class) {
    case 'H5T_INTEGER':
    case 'H5T_FLOAT':
      return convertHsdsNumericType(hsdsType);

    case 'H5T_COMPOUND':
      return convertHsdsCompoundType(hsdsType);

    case 'H5T_STRING':
      return {
        class: DTypeClass.String,
        charSet: hsdsType.charSet.endsWith('ASCII') ? 'ASCII' : 'UTF-8',
        length:
          hsdsType.length === 'H5T_VARIABLE' ? undefined : hsdsType.length,
      };

    case 'H5T_ARRAY':
    case 'H5T_VLEN':
      return {
        class:
          hsdsType.class === 'H5T_ARRAY' ? DTypeClass.Array : DTypeClass.VLen,
        base: convertHsdsType(hsdsType.base),
        dims: hsdsType.dims,
      };

    case 'H5T_ENUM':
      // Booleans are stored as Enum by h5py
      // https://docs.h5py.org/en/stable/faq.html#what-datatypes-are-supported
      if (hsdsType.mapping.FALSE === 0) {
        return { class: DTypeClass.Bool };
      }

      return {
        class: DTypeClass.Enum,
        base: convertHsdsType(hsdsType.base),
        mapping: hsdsType.mapping,
      };

    default:
      return { class: DTypeClass.Unknown };
  }
}

export function convertHsdsAttributes(
  attrs: HsdsAttributeResponse[]
): Attribute[] {
  return attrs.map((attr) => ({
    name: attr.name,
    shape: convertHsdsShape(attr.shape),
    type: convertHsdsType(attr.type),
    value: attr.value,
  }));
}
