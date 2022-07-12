import type { Primitive, PrintableType } from '@h5web/shared';
import { formatMatrixValue } from '@h5web/shared';
import { formatMatrixComplex } from '@h5web/shared';

export function compoundFormatter(value: Primitive<PrintableType>) {
  if (Array.isArray(value)) {
    return formatMatrixComplex(value);
  }

  if (typeof value === 'number') {
    return formatMatrixValue(value);
  }

  return value.toString();
}
