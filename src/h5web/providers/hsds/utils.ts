import { isString } from 'lodash-es';
import { isDataset, isGroup } from '../../guards';
import {
  HDF5BaseType,
  HDF5Endianness,
  HDF5Type,
  HDF5TypeClass,
} from '../hdf5-models';
import type { Entity } from '../models';
import type {
  HsdsLink,
  HsdsExternalLink,
  HsdsDataset,
  HsdsGroup,
  HsdsType,
  HsdsBaseType,
} from './models';

export function isHsdsExternalLink(link: HsdsLink): link is HsdsExternalLink {
  return 'h5domain' in link;
}

export function isHsdsGroup(entity: Entity): entity is HsdsGroup {
  return isGroup(entity) && 'id' in entity;
}

export function isHsdsDataset(entity: Entity): entity is HsdsDataset {
  return isDataset(entity) && 'id' in entity;
}

export function assertHsdsDataset(
  entity: Entity
): asserts entity is HsdsDataset {
  if (!isHsdsDataset(entity)) {
    throw new Error('Expected entity to be HSDS dataset');
  }
}

export function convertHsdsBaseType(hsdsBaseType: HsdsBaseType): HDF5BaseType {
  if (hsdsBaseType.class === HDF5TypeClass.String) {
    return {
      class: HDF5TypeClass.String,
      charSet: hsdsBaseType.charSet.endsWith('ASCII') ? 'ASCII' : 'UTF8',
      length: hsdsBaseType.length,
    };
  }

  const { class: hsdsClass, base } = hsdsBaseType;

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
      return {
        class: HDF5TypeClass.Enum,
        base: convertHsdsBaseType(hsdsType.base),
        mapping: hsdsType.mapping,
      };

    case HDF5TypeClass.Array:
      return {
        class: HDF5TypeClass.Array,
        base: convertHsdsBaseType(hsdsType.base),
        dims: hsdsType.dims,
      };

    case HDF5TypeClass.VLen:
      return {
        class: HDF5TypeClass.VLen,
        base: convertHsdsBaseType(hsdsType.base),
      };

    case HDF5TypeClass.Compound:
      return {
        class: HDF5TypeClass.Compound,
        fields: hsdsType.fields.map((v) => ({
          name: v.name,
          type: convertHsdsType(v.type),
        })),
      };

    case HDF5TypeClass.Integer:
    case HDF5TypeClass.Float:
    case HDF5TypeClass.String:
      return convertHsdsBaseType(hsdsType);

    default:
      throw new Error(`Unknown type ${JSON.stringify(hsdsType)}`);
  }
}
