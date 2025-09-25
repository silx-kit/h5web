import {
  type ComplexType,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import { type ReactNode } from 'react';

import {
  useDatasetsValues,
  useDatasetValue,
  usePrefetchValues,
} from '../../hooks';
import { type NxData, type NxValues } from './models';

interface Props<T extends NumericLikeType | ComplexType> {
  nxData: NxData<T>;
  selection?: string; // for slice-by-slice fetching
  render: (val: NxValues<T>) => ReactNode;
}

function NxValuesFetcher<T extends NumericLikeType | ComplexType>(
  props: Props<T>,
) {
  const { nxData, selection, render } = props;
  const { signalDef, axisDefs, auxDefs, titleDataset } = nxData;

  const axisDatasets = axisDefs.map((def) => def?.dataset);
  const auxDatasets = auxDefs.map((def) => def.dataset);
  const auxErrorDatasets = auxDefs.map((def) => def.errorDataset);

  usePrefetchValues([titleDataset, ...axisDatasets]);
  usePrefetchValues(
    [
      signalDef.dataset,
      signalDef.errorDataset,
      ...auxDatasets,
      ...auxErrorDatasets,
    ],
    selection,
  );

  const title = useDatasetValue(titleDataset) || signalDef.label;
  const signal = useDatasetValue(signalDef.dataset, selection);
  const errors = useDatasetValue(signalDef.errorDataset, selection);
  const auxValues = useDatasetsValues(auxDatasets, selection);
  const auxErrors = useDatasetsValues(auxErrorDatasets, selection);
  const axisValues = useDatasetsValues(axisDatasets);

  // Apply scalar transforms when specified on the dataset defs.
  // transform.expression is a sanitized JS expression fragment like '*10+1' or '**2'.
  const applyTransform = (arr: any, transform: { expression?: string } | undefined) => {
    if (!arr || !transform || !transform.expression) return arr;
    const expr = transform.expression;
    // Basic validation: only allow digits, variable 'v', operators, parentheses, decimals and exponent notation
    if (!/^[v0-9+\-*/().eE]+$/.test(expr)) return arr;

    // Build a function `f(v)` to evaluate the expression in local scope
    // eslint-disable-next-line no-new-func
    const f = new Function('v', `return ${expr};`);

    const data = Array.isArray(arr) ? arr : ('data' in arr ? (arr as any).data : arr);
    const mapped = data.map((v: number) => (typeof v === 'number' ? f(v) : v));

    if (arr && 'data' in arr) {
      return { ...arr, data: mapped } as any;
    }
    return mapped;
  };

  const signalTransformed = applyTransform(signal, signalDef.transform as any);
  const errorsTransformed = applyTransform(errors, signalDef.transform as any);

  const auxValuesTransformed = auxValues.map((val, i) =>
    applyTransform(val, auxDefs[i]?.transform as any),
  );
  const auxErrorsTransformed = auxErrors.map((val, i) =>
    applyTransform(val, auxDefs[i]?.transform as any),
  );

  return render({
    title,
    signal: signalTransformed,
    errors: errorsTransformed,
    auxValues: auxValuesTransformed,
    auxErrors: auxErrorsTransformed,
    axisValues,
  });
}

export default NxValuesFetcher;
