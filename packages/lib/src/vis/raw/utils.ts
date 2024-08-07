import { assertDefined, assertNonNull } from '@h5web/shared/guards';
import type { TypedArray } from 'ndarray';

export function getTypedArrayClass(arr: TypedArray): string {
  const res = /^\[object (.+)\]$/u.exec(Object.prototype.toString.call(arr));
  assertNonNull(res);

  const [, arrClass] = res;
  assertDefined(arrClass);
  return arrClass;
}
