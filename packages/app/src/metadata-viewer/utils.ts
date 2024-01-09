import {
  isH5WebComplex,
  isNumericType,
  isScalarShape,
} from '@h5web/shared/guards';
import type {
  ComplexArray,
  DType,
  H5WebComplex,
  Shape,
} from '@h5web/shared/hdf5-models';
import { DTypeClass } from '@h5web/shared/hdf5-models';
import { formatScalarComplex } from '@h5web/shared/utils';

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

export function renderType(type: DType): string {
  if (isNumericType(type)) {
    const { endianness, size } = type;
    return `${type.class}, ${size}-bit${endianness ? `, ${endianness}` : ''}`;
  }

  if (type.class === DTypeClass.String) {
    const { length, charSet } = type;
    return `${charSet ? `${charSet} string` : 'String'}${
      length !== undefined ? `, ${length} characters` : ''
    }`;
  }

  return type.class;
}

export function renderComplex(complex: H5WebComplex | ComplexArray): string {
  if (isH5WebComplex(complex)) {
    return formatScalarComplex(complex);
  }

  return `[ ${complex.map((c) => renderComplex(c)).join(', ')} ]`;
}
