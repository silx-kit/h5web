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

  // Apply simple scalar transforms when specified on the dataset defs.
  const applyTransform = (arr: any, transform: { op: '+' | '-' | '*' | '/'; operand: number } | undefined) => {
    if (!arr || !transform) return arr;
    // arr may be TypedArray or ndarray-like; we handle common JS arrays and TypedArrays
    const data = Array.isArray(arr) ? arr : ('data' in arr ? (arr as any).data : arr);
    const mapped = data.map((v: number) => {
      if (typeof v !== 'number') return v;
      switch (transform.op) {
        case '+':
          return v + transform.operand;
        case '-':
          return v - transform.operand;
        case '*':
          return v * transform.operand;
        case '/':
          return v / transform.operand;
        default:
          return v;
      }
    });
    // If original was ndarray-like, try to return same shape object shape
    if (arr && 'data' in arr) {
      // shallow clone with replaced data array
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
