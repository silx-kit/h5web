import { Notation } from '@h5web/lib';
import { isComplexType, isEnumType, isNumericType } from '@h5web/shared/guards';
import type {
  ComplexType,
  NumericType,
  PrintableCompoundType,
  PrintableType,
} from '@h5web/shared/hdf5-models';
import { DTypeClass } from '@h5web/shared/hdf5-models';
import type { ValueFormatter } from '@h5web/shared/vis-models';
import {
  createComplexFormatter,
  createEnumFormatter,
} from '@h5web/shared/vis-utils';
import { format } from 'd3-format';

export function createNumericFormatter(
  notation: Notation,
): ValueFormatter<NumericType> {
  switch (notation) {
    case Notation.FixedPoint:
      return format('.3f');
    case Notation.Scientific:
      return format('.3e');
    default:
      return format('.5~g');
  }
}

export function createMatrixComplexFormatter(
  notation: Notation,
): ValueFormatter<ComplexType> {
  const formatStr =
    notation === Notation.FixedPoint
      ? '.2f'
      : `.3~${notation === Notation.Scientific ? 'e' : 'g'}`;

  return createComplexFormatter(formatStr, true);
}

export function getFormatter(
  type: PrintableType,
  notation: Notation,
): ValueFormatter<PrintableType> {
  if (isComplexType(type)) {
    return createMatrixComplexFormatter(notation);
  }

  if (isNumericType(type)) {
    return createNumericFormatter(notation);
  }

  if (isEnumType(type)) {
    return createEnumFormatter(type.mapping);
  }

  return (val) => (val as string | boolean).toString();
}

export function getCellWidth(
  type: PrintableType | PrintableCompoundType,
): number {
  if (type.class === DTypeClass.Compound) {
    return Math.max(...Object.values(type.fields).map(getCellWidth));
  }

  if (type.class === DTypeClass.String) {
    return type.length !== undefined ? 12 * type.length : 300;
  }

  if (type.class === DTypeClass.Bool) {
    return 90;
  }

  if (type.class === DTypeClass.Complex) {
    return 240;
  }

  return 120;
}
