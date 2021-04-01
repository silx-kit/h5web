import { isScalarShape } from '../guards';
import { HDF5Type, HDF5TypeClass } from '../providers/hdf5-models';
import type { Shape } from '../providers/models';

const ENDIANNESS_LABELS = {
  LE: 'little-endian',
  BE: 'big-endian',
  Native: 'native',
  'Not applicable': '',
};

export function renderShape(shape: Shape): string {
  if (shape === null) {
    return 'None';
  }

  if (isScalarShape(shape)) {
    return 'Scalar';
  }

  return shape.length === 1
    ? shape.toString()
    : `${shape.join(' x ')} = ${shape.reduce((acc, value) => acc * value)}`;
}

export function renderType(type: HDF5Type): string {
  if (typeof type === 'string') {
    return type;
  }

  // Remove leading `H5T_`
  const classLabel = type.class.slice(4).toLowerCase();

  if (
    type.class === HDF5TypeClass.Integer ||
    type.class === HDF5TypeClass.Float
  ) {
    const { endianness, size } = type;
    const typeInfos = `${classLabel}, ${
      type.class === HDF5TypeClass.Integer && type.unsigned ? 'unsigned' : ''
    } ${size}-bit`;

    if (endianness === 'Not applicable') {
      return typeInfos;
    }

    return `${typeInfos}, ${ENDIANNESS_LABELS[endianness]}`;
  }

  if (type.class === HDF5TypeClass.String) {
    const { length, charSet } = type;

    return `${classLabel},
    ${charSet},
    ${Number.isInteger(length) ? `${length} characters` : 'variable length'}`;
  }

  return classLabel;
}
