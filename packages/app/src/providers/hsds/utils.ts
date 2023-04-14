import {
  type ArrayShape,
  type Attribute,
  type ComplexType,
  type CompoundType,
  type Dataset,
  type DType,
  DTypeClass,
  Endianness,
  type Entity,
  type Group,
  isGroup,
  type NumericType,
  type ScalarShape,
  type Shape,
} from '@h5web/shared';

import {
  type HsdsAttribute,
  type HsdsCompoundType,
  type HsdsEntity,
  type HsdsNumericType,
  type HsdsShape,
  type HsdsType,
} from './models';

export function isHsdsGroup(entity: HsdsEntity): entity is HsdsEntity<Group> {
  return isGroup(entity);
}

export function assertHsdsEntity<T extends Entity>(
  entity: T
): asserts entity is HsdsEntity<T> {
  if (!('id' in entity)) {
    throw new Error('Expected entity to be HSDS entity');
  }
}

export function assertHsdsDataset(
  dataset: Dataset<ScalarShape | ArrayShape>
): asserts dataset is HsdsEntity<Dataset<ScalarShape | ArrayShape>> {
  if (!('id' in dataset)) {
    throw new Error('Expected entity to be HSDS dataset');
  }
}

function assertHsdsNumericType(
  type: HsdsType
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
    const [{ type: realType }, { type: imagType }] = fields;
    assertHsdsNumericType(realType);
    assertHsdsNumericType(imagType);

    return {
      class: DTypeClass.Complex,
      realType: convertHsdsNumericType(realType),
      imagType: convertHsdsNumericType(imagType),
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

export function convertHsdsAttributes(attrs: HsdsAttribute[]): Attribute[] {
  return attrs.map((attr) => ({
    name: attr.name,
    shape: convertHsdsShape(attr.shape),
    type: convertHsdsType(attr.type),
  }));
}
