import { hasComplexType } from '@h5web/shared/guards';
import type {
  ArrayShape,
  Dataset,
  H5WebComplex,
  PrintableType,
} from '@h5web/shared/hdf5-models';
import { formatScalarComplex } from '@h5web/shared/vis-utils';

import type { ValueFormatter } from '../models';

export function getFormatter(
  dataset: Dataset<ArrayShape, PrintableType>,
): ValueFormatter<PrintableType> {
  if (hasComplexType(dataset)) {
    return (val) => formatScalarComplex(val as H5WebComplex);
  }

  return (val) => (val as number | string | boolean).toString();
}
