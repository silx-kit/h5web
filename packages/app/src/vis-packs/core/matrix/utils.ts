import type {
  ArrayShape,
  Dataset,
  H5WebComplex,
  PrintableType,
} from '@h5web/shared';
import {
  DTypeClass,
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
  const { type } = dataset;

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
