import { hasComplexType, hasEnumType } from '@h5web/shared/guards';
import type {
  ArrayShape,
  Dataset,
  PrintableType,
} from '@h5web/shared/hdf5-models';
import type { ValueFormatter } from '@h5web/shared/vis-models';
import {
  createEnumFormatter,
  formatScalarComplex,
} from '@h5web/shared/vis-utils';

export function getFormatter(
  dataset: Dataset<ArrayShape, PrintableType>,
): ValueFormatter<PrintableType> {
  if (hasComplexType(dataset)) {
    return formatScalarComplex;
  }

  if (hasEnumType(dataset)) {
    return createEnumFormatter(dataset.type.mapping);
  }

  return (val) => (val as number | string | boolean).toString();
}
