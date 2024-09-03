import { Notation } from '@h5web/lib';
import {
  assertNdArrayValue,
  isBoolType,
  isComplexType,
  isEnumType,
  isNumericType,
} from '@h5web/shared/guards';
import type {
  ArrayValue,
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
  formatBool,
} from '@h5web/shared/vis-utils';
import { format } from 'd3-format';
import type { NdArray } from 'ndarray';

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

export function getCellFormatter(
  dataArray: NdArray<ArrayValue<PrintableType>>,
  type: PrintableType,
  notation: Notation,
): (row: number, col: number) => string {
  if (isComplexType(type)) {
    assertNdArrayValue(type, dataArray);
    const formatter = createMatrixComplexFormatter(notation);
    return (row, col) => formatter(dataArray.get(row, col));
  }

  if (isNumericType(type)) {
    assertNdArrayValue(type, dataArray);
    const formatter = createNumericFormatter(notation);
    return (row, col) => formatter(dataArray.get(row, col));
  }

  if (isBoolType(type)) {
    assertNdArrayValue(type, dataArray);
    return (row, col) => formatBool(dataArray.get(row, col));
  }

  if (isEnumType(type)) {
    assertNdArrayValue(type, dataArray);
    const formatter = createEnumFormatter(type.mapping);
    return (row, col) => formatter(dataArray.get(row, col));
  }

  // `StringType`
  assertNdArrayValue(type, dataArray);
  return (row, col) => dataArray.get(row, col);
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
