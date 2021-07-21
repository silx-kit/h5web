import { hasComplexType } from '../../../guards';
import type {
  ArrayShape,
  Dataset,
  H5WebComplex,
} from '../../../providers/models';
import { formatScalarComplex } from '../../../utils';
import type { PrintableType, ValueFormatter } from '../models';

export function getFormatter(
  dataset: Dataset<ArrayShape, PrintableType>
): ValueFormatter<PrintableType> {
  if (hasComplexType(dataset)) {
    return (val) => formatScalarComplex(val as H5WebComplex);
  }

  return (val) => (val as number | string | boolean).toString();
}
