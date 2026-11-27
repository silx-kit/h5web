import {
  type ArrayValue,
  type CompoundType,
  type PrintableType,
  type ScalarValue,
} from '@h5web/shared/hdf5-models';
import { type NdArray } from 'ndarray';

export function getCompoundFieldValues(
  value:
    | ScalarValue<CompoundType<PrintableType>>
    | ArrayValue<CompoundType<PrintableType>>,
  isScalar: boolean,
): ScalarValue<PrintableType>[] {
  // Scalar value is a single compound (i.e. array of field values) and must not be flattened,
  // otherwise array-like field values (e.g. complex numbers) would get flattened too
  return isScalar
    ? (value as ScalarValue<CompoundType<PrintableType>>)
    : (value as ArrayValue<CompoundType<PrintableType>>).flat(1);
}

export function generateCsv(
  names: string[],
  compoundArray: NdArray<ScalarValue<PrintableType>[]>,
  formatters: ((val: ScalarValue<PrintableType>) => string)[],
): string {
  let csv = names.map((n) => n.replaceAll(',', '')).join(','); // column headers
  const [dim1, dim2] = compoundArray.shape;

  for (let i = 0; i < dim1; i += 1) {
    let line = '\n';

    for (let j = 0; j < dim2; j += 1) {
      line += `${formatters[j](compoundArray.get(i, j))},`;
    }

    csv += line.slice(0, -1); // trim trailing comma
  }

  return csv;
}
