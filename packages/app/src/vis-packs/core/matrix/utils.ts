import { Notation } from '@h5web/lib';
import {
  isBoolType,
  isComplexType,
  isEnumType,
  isNumericType,
} from '@h5web/shared/guards';
import {
  type BooleanType,
  type ComplexType,
  type CompoundType,
  DTypeClass,
  type NumericType,
  type PrintableType,
} from '@h5web/shared/hdf5-models';
import { type ValueFormatter } from '@h5web/shared/vis-models';
import {
  createComplexFormatter,
  createEnumFormatter,
  formatBool,
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

  if (isBoolType(type)) {
    return formatBool as ValueFormatter<BooleanType>;
  }

  if (isEnumType(type)) {
    return createEnumFormatter(type.mapping);
  }

  return (val) => (val as string).toString(); // call `toString()` for safety, in case type cast is wrong
}

export function getCellWidth(
  type: PrintableType | CompoundType<PrintableType>,
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
