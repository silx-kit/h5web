import { hasBoolType, hasComplexType, hasEnumType } from '@h5web/shared/guards';
import {
  type HasType,
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
  obj: HasType<PrintableType>,
): (val: ScalarValue<PrintableType>) => string; // override distributivity of `ValueFormatter`

export function getFormatter<T extends PrintableType>(
  obj: HasType<T>,
): ValueFormatter<PrintableType> {
  if (hasBoolType(obj)) {
    return formatBool;
  }

  if (hasEnumType(obj)) {
    return createEnumFormatter(obj.type.mapping);
  }

  if (hasComplexType(obj)) {
    return createComplexFormatter((val) => val.toString());
  }

  return (val: number | bigint | string) => val.toString();
}
