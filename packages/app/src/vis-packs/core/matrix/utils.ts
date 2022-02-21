import type {
  ArrayShape,
  Dataset,
  H5WebComplex,
  PrintableType,
} from '@h5web/shared';
import {
  formatMatrixComplex,
  formatMatrixValue,
  hasComplexType,
  hasNumericType,
} from '@h5web/shared';

import type { ValueFormatter } from '../models';

export function getFormatter(
  dataset: Dataset<ArrayShape, PrintableType>
): ValueFormatter<PrintableType> {
  if (hasComplexType(dataset)) {
    return (val) => formatMatrixComplex(val as H5WebComplex);
  }

  if (hasNumericType(dataset)) {
    return (val) => formatMatrixValue(val as number);
  }

  return (val) => (val as string).toString();
}

export function getCellWidth(
  dataset: Dataset<ArrayShape, PrintableType>
): number {
  if (hasComplexType(dataset)) {
    return 232;
  }

  return 116;
}
