import type { NdArray } from 'ndarray';
import { hasComplexType, hasNumericType } from '../../../guards';
import type {
  ArrayShape,
  Dataset,
  H5WebComplex,
  Primitive,
} from '../../../providers/models';
import { formatMatrixComplex, formatMatrixValue } from '../../../utils';
import type { PrintableType, ValueFormatter } from '../models';

export function getFormatter(
  dataset: Dataset<ArrayShape, PrintableType>
): ValueFormatter<PrintableType> {
  if (hasComplexType(dataset)) {
    return (val) => formatMatrixComplex(val as H5WebComplex);
  }

  if (hasNumericType(dataset)) {
    return (val) => formatMatrixValue(val as number);
  }

  return (val) => (val as string).toString();
}

export function sliceToCsv(slice: NdArray<Primitive<PrintableType>[]>): string {
  let csv = '';

  if (slice.shape.length === 1) {
    for (let i = 0; i < slice.shape[0]; i++) {
      csv += `${slice.get(i).toString()}\n`; // complex numbers are stringifyied as two values
    }

    return csv;
  }

  if (slice.shape.length === 2) {
    for (let i = 0; i < slice.shape[0]; i++) {
      let line = '';
      for (let j = 0; j < slice.shape[1]; j++) {
        line += `${slice.get(i, j).toString()},`; // complex numbers are stringifyied as two values
      }
      csv += `${line.replace(/,$/u, '\n')}`;
    }

    return csv;
  }

  throw new Error('Expected at most 2 dimensions');
}
