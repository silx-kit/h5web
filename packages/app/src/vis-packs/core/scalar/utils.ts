import {
  type ArrayShape,
  type Dataset,
  formatScalarComplex,
  type H5WebComplex,
  hasComplexType,
  type PrintableType,
} from '@h5web/shared';

import { type ValueFormatter } from '../models';

export function getFormatter(
  dataset: Dataset<ArrayShape, PrintableType>
): ValueFormatter<PrintableType> {
  if (hasComplexType(dataset)) {
    return (val) => formatScalarComplex(val as H5WebComplex);
  }

  return (val) => (val as number | string | boolean).toString();
}
