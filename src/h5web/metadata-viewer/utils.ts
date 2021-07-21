import { isNumericType, isScalarShape, isH5WebComplex } from '../guards';
import {
  ComplexArray,
  DType,
  DTypeClass,
  H5WebComplex,
  Shape,
} from '../providers/models';
import { formatScalarComplex } from '../utils';

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
