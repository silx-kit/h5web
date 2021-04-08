import { isNumericType, isScalarShape } from '../guards';
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
  if (isNumericType(type)) {
    const { endianness, size } = type;
    const endiannessLabel = ENDIANNESS_LABELS[endianness];

    return `${type.class}, ${size}-bit${
      endiannessLabel ? `, ${endiannessLabel}` : ''
    }`;
  }

  if (type.class === HDF5TypeClass.String) {
    const { length, charSet } = type;

    return `${type.class}, ${charSet}, ${
      Number.isInteger(length) ? `${length} characters` : 'variable length'
    }`;
  }

  return type.class;
}
