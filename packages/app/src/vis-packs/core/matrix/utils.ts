import type {
  Dataset,
  ArrayShape,
  PrintableType,
  H5WebComplex,
} from '@h5web/shared';
import {
  hasComplexType,
  hasNumericType,
  formatMatrixComplex,
  formatMatrixValue,
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
