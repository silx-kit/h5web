import { Notation } from '@h5web/lib';
import {
  isBoolType,
  isComplexType,
  isEnumType,
  isFloatType,
  isIntegerType,
} from '@h5web/shared/guards';
import {
  type CompoundType,
  DTypeClass,
  type NumericType,
  type PrintableType,
  type ScalarValue,
} from '@h5web/shared/hdf5-models';
import { type ValueFormatter } from '@h5web/shared/vis-models';
import {
  createComplexFormatter,
  createEnumFormatter,
  formatBool,
} from '@h5web/shared/vis-utils';
import { format } from 'd3-format';

export function createIntegerFormatter(
  notation: Notation,
): (val: ScalarValue<NumericType>) => string {
  if (notation === Notation.Scientific) {
    const formatter = format('.3e');
    return (val) => formatter(Number(val));
  }

  return (val) => val.toString();
}

export function createFloatFormatter(
  notation: Notation,
): (val: number) => string {
  switch (notation) {
    case Notation.Exact:
      return (val) => val.toString();
    case Notation.Scientific:
      return format('.3e');
    default:
      return format('.5~g');
  }
}

export function getFormatter<T extends PrintableType>(
  type: T,
  notation: Notation,
): (val: ScalarValue<T>) => string; // override distributivity of `ValueFormatter`

export function getFormatter(
  type: PrintableType,
  notation: Notation,
): ValueFormatter<PrintableType> {
  if (isIntegerType(type)) {
    return createIntegerFormatter(notation);
  }

  if (isFloatType(type)) {
    return createFloatFormatter(notation);
  }

  if (isBoolType(type)) {
    return formatBool;
  }

  if (isEnumType(type)) {
    return createEnumFormatter(type.mapping);
  }

  if (isComplexType(type)) {
    return createComplexFormatter(
      getFormatter(type.realType, notation),
      getFormatter(type.imagType, notation),
    );
  }

  return (val: string) => val.toString();
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
