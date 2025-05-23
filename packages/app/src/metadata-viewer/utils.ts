import {
  isFloatType,
  isH5WebComplex,
  isIntegerType,
  isScalarShape,
} from '@h5web/shared/guards';
import {
  type ComplexArray,
  type DType,
  DTypeClass,
  type H5WebComplex,
  type Shape,
} from '@h5web/shared/hdf5-models';
import { formatScalarComplex } from '@h5web/shared/vis-utils';

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
  if (isIntegerType(type)) {
    const sign = type.signed ? ' (signed)' : ' (unsigned)';
    const endianness = type.endianness ? `, ${type.endianness}` : '';
    return `Integer${sign}, ${type.size}-bit${endianness}`;
  }

  if (isFloatType(type)) {
    const endianness = type.endianness ? `, ${type.endianness}` : '';
    return `Float, ${type.size}-bit${endianness}`;
  }

  if (type.class === DTypeClass.String) {
    const { length, charSet } = type;
    return `${charSet ? `${charSet} string` : 'String'}, ${
      length === undefined ? 'variable length' : `${length} characters`
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
