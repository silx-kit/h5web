import Complex from 'complex.js';
import { isString } from 'lodash-es';
import { isDataset, isGroup } from '../../guards';
import {
  HDF5Endianness,
  HDF5FloatType,
  HDF5IntegerType,
  HDF5Shape,
  HDF5ShapeClass,
  HDF5Type,
  HDF5TypeClass,
} from '../hdf5-models';
import type {
  Entity,
  ComplexArray,
  Shape,
  Attribute,
  Group,
  Dataset,
} from '../models';
import type {
  HsdsLink,
  HsdsExternalLink,
  HsdsType,
  HsdsIntegerType,
  HsdsFloatType,
  HsdsComplex,
  HsdsComplexValue,
  HsdsEntity,
  HsdsAttributeWithValueResponse,
} from './models';

export function isHsdsExternalLink(link: HsdsLink): link is HsdsExternalLink {
  return 'h5domain' in link;
}

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

export function convertHsdsShape(shape: HDF5Shape): Shape {
  switch (shape.class) {
    case HDF5ShapeClass.Simple:
      return shape.dims;
    case HDF5ShapeClass.Scalar:
      return [];
    default:
      return null;
  }
}

export function convertHsdsNumericType(
  hsdsType: HsdsIntegerType | HsdsFloatType
): HDF5IntegerType | HDF5FloatType {
  const { class: hsdsClass, base } = hsdsType;

  const regex = /H5T_(?:STD|IEEE)_([A-Z])(\d+)(BE|LE)/u;
  const matches = regex.exec(base);

  if (!matches) {
    throw new Error(`Unrecognized base ${base}`);
  }

  const [, sign, size, endianness] = matches;

  return {
    class: hsdsClass,
    endianness: endianness as HDF5Endianness,
    size: Number.parseInt(size, 10),
    ...(sign === 'U' ? { unsigned: true } : {}),
  };
}

export function convertHsdsType(hsdsType: HsdsType): HDF5Type {
  if (isString(hsdsType)) {
    return hsdsType;
  }

  switch (hsdsType.class) {
    case HDF5TypeClass.Enum:
      // Booleans are stored as Enum by h5py
      // https://docs.h5py.org/en/stable/faq.html#what-datatypes-are-supported
      if (hsdsType.mapping.FALSE === 0) {
        return {
          class: HDF5TypeClass.Bool,
        };
      }

      return {
        class: HDF5TypeClass.Enum,
        base: convertHsdsType(hsdsType.base),
        mapping: hsdsType.mapping,
      };

    case HDF5TypeClass.Array:
      return {
        class: HDF5TypeClass.Array,
        base: convertHsdsType(hsdsType.base),
        dims: hsdsType.dims,
      };

    case HDF5TypeClass.VLen:
      return {
        class: HDF5TypeClass.VLen,
        base: convertHsdsType(hsdsType.base),
      };

    case HDF5TypeClass.Compound:
      const { fields } = hsdsType; // eslint-disable-line no-case-declarations
      if (
        fields.length === 2 &&
        fields[0].name === 'r' &&
        fields[1].name === 'i'
      ) {
        return {
          class: HDF5TypeClass.Complex,
          realType: convertHsdsType(fields[0].type),
          imagType: convertHsdsType(fields[1].type),
        };
      }

      return {
        class: HDF5TypeClass.Compound,
        fields: hsdsType.fields.map((v) => ({
          name: v.name,
          type: convertHsdsType(v.type),
        })),
      };

    case HDF5TypeClass.String:
      return {
        class: HDF5TypeClass.String,
        charSet: hsdsType.charSet.endsWith('ASCII') ? 'ASCII' : 'UTF8',
        length: hsdsType.length,
      };

    case HDF5TypeClass.Integer:
    case HDF5TypeClass.Float:
      return convertHsdsNumericType(hsdsType);

    default:
      throw new Error(`Unknown type ${JSON.stringify(hsdsType)}`);
  }
}

export function convertHsdsAttributes(
  attrs: HsdsAttributeWithValueResponse[]
): Attribute[] {
  return attrs.map((attr) => ({
    ...attr,
    shape: convertHsdsShape(attr.shape),
    type: convertHsdsType(attr.type),
  }));
}

export function parseComplex(complex: HsdsComplex): ComplexArray | Complex {
  if (isComplexValue(complex)) {
    return new Complex(complex);
  }

  return complex.map((v) => parseComplex(v));
}

function isComplexValue(complex: HsdsComplex): complex is HsdsComplexValue {
  return complex.length === 2 && typeof complex[0] === 'number';
}
