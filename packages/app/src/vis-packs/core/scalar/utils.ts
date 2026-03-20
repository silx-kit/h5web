import {
  isBoolType,
  isComplexType,
  isEnumType,
  isNumericType,
  isStringType,
} from '@h5web/shared/guards';
import { type DType, type ScalarValue } from '@h5web/shared/hdf5-models';
import { type ValueFormatter } from '@h5web/shared/vis-models';
import {
  createComplexFormatter,
  createEnumFormatter,
  formatBool,
  formatRaw,
} from '@h5web/shared/vis-utils';

const MAGIC_NUMBERS = [
  [0xff, 0xd8, 0xff], // JPEG
  [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
];

export function isBinaryImage(binArray: Uint8Array): boolean {
  return MAGIC_NUMBERS.some(
    (nums) => binArray.slice(0, nums.length).toString() === nums.toString(),
  );
}

export function getFormatter<T extends DType>(
  type: T,
): (val: ScalarValue<T>) => string; // override distributivity of `ValueFormatter`

export function getFormatter(type: DType): ValueFormatter<DType> {
  if (isStringType(type) || isNumericType(type)) {
    return (val: number | bigint | string) => val.toString();
  }

  if (isBoolType(type)) {
    return formatBool;
  }

  if (isEnumType(type)) {
    return createEnumFormatter(type.mapping);
  }

  if (isComplexType(type)) {
    return createComplexFormatter((val) => val.toString());
  }

  return formatRaw;
}
