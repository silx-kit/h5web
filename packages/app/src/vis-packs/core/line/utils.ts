import { type AuxiliaryParams, type AxisParams } from '@h5web/lib';
import { type NumArray } from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';

export function generateCsv(
  name: string | undefined,
  dataArray: NdArray<NumArray>,
  abscissaParams: AxisParams,
  errorsArray: NdArray<NumArray> | undefined,
  auxiliaries: (AuxiliaryParams & { label: string })[], // required label
): string {
  let csv = '';
  const isNexus = !!name;

  // Column headers
  if (isNexus) {
    const abscissaLabel = abscissaParams.label?.replaceAll(',', '');

    csv += abscissaLabel || 'x';
    csv += `,${name.replaceAll(',', '')}`;
    csv += errorsArray ? `,errors` : '';

    for (const aux of auxiliaries) {
      const auxLabel = aux.label.replaceAll(',', '');
      csv += `,${auxLabel}`;
      csv += aux.errors ? `,${auxLabel}_errors` : '';
    }
  }

  // Column values
  for (let i = 0; i < dataArray.shape[0]; i += 1) {
    csv += csv.length > 0 ? '\n' : '';

    csv += isNexus
      ? `${(abscissaParams.value ? abscissaParams.value[i] : i).toString()},`
      : '';

    csv += dataArray.get(i).toString();
    csv += errorsArray ? `,${errorsArray.get(i).toString()}` : '';

    for (const aux of auxiliaries) {
      csv += `,${aux.array.get(i).toString()}`;
      csv += aux.errors ? `,${aux.errors.get(i).toString()}` : '';
    }
  }

  return csv;
}
