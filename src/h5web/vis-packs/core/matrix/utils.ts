import { hasComplexType, hasNumericType } from '../../../guards';
import { renderComplex } from '../../../metadata-viewer/utils';
import type {
  ArrayShape,
  Dataset,
  H5WebComplex,
} from '../../../providers/models';
import type { PrintableType, ValueFormatter } from '../models';
import { formatNumber } from '../utils';

export function getFormatter(
  dataset: Dataset<ArrayShape, PrintableType>
): ValueFormatter<PrintableType> {
  if (hasComplexType(dataset)) {
    return (val) => renderComplex(val as H5WebComplex, '.2e');
  }

  if (hasNumericType(dataset)) {
    return (val) => formatNumber(val as number);
  }

  return (val) => (val as string).toString();
}
