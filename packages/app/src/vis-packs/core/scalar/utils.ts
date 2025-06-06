import { hasBoolType, hasComplexType, hasEnumType } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type PrintableType,
  type ScalarValue,
} from '@h5web/shared/hdf5-models';
import { type ValueFormatter } from '@h5web/shared/vis-models';
import {
  createComplexFormatter,
  createEnumFormatter,
  formatBool,
} from '@h5web/shared/vis-utils';

export function getFormatter(
  dataset: Dataset<ArrayShape, PrintableType>,
): (val: ScalarValue<PrintableType>) => string; // override distributivity of `ValueFormatter`

export function getFormatter<T extends PrintableType>(
  dataset: Dataset<ArrayShape, T>,
): ValueFormatter<PrintableType> {
  if (hasBoolType(dataset)) {
    return formatBool;
  }

  if (hasEnumType(dataset)) {
    return createEnumFormatter(dataset.type.mapping);
  }

  if (hasComplexType(dataset)) {
    return createComplexFormatter((val) => val.toString());
  }

  return (val: number | bigint | string) => val.toString();
}
