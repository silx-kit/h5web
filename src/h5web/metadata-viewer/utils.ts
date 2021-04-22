import { isNumericType, isScalarShape } from '../guards';
import {
  ComplexArray,
  DType,
  DTypeClass,
  H5WebComplex,
  Shape,
} from '../providers/models';
import { formatComplexValue } from '../utils';

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

type FormattedArray = (string | FormattedArray)[];

function isComplexValue(
  complex: H5WebComplex | ComplexArray
): complex is H5WebComplex {
  return typeof complex[0] === 'number';
}

export function formatComplex(
  complex: H5WebComplex | ComplexArray
): string | FormattedArray {
  if (isComplexValue(complex)) {
    return formatComplexValue(complex);
  }

  return `[${complex.map((c) => formatComplex(c)).join(',')}]`;
}
