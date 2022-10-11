import type { NumericType, ComplexType } from '@h5web/shared';
import type { ReactNode } from 'react';

import {
  useDatasetValue,
  useDatasetValues,
  usePrefetchValues,
} from '../core/hooks';
import type { NxData, NxValues } from './models';

interface Props<T extends NumericType | ComplexType> {
  nxData: NxData<T>;
  selection?: string; // for slice-by-slice fetching
  render: (val: NxValues<T>) => ReactNode;
}

function NxValuesFetcher<T extends NumericType | ComplexType>(props: Props<T>) {
  const { nxData, selection, render } = props;
  const { signalDef, axisDefs, auxDefs, titleDataset } = nxData;

  const axisDatasets = axisDefs.map((def) => def?.dataset);
  const auxDatasets = auxDefs.map((def) => def?.dataset);
  const auxErrorDatasets = auxDefs.map((def) => def?.errorDataset);

  usePrefetchValues([titleDataset, ...axisDatasets]);
  usePrefetchValues(
    [
      signalDef.dataset,
      signalDef.errorDataset,
      ...auxDatasets,
      ...auxErrorDatasets,
    ],
    selection
  );

  const title = useDatasetValue(titleDataset) || signalDef.label;
  const signal = useDatasetValue(signalDef.dataset, selection);
  const errors = useDatasetValue(signalDef.errorDataset, selection);
  const auxValues = useDatasetValues(auxDatasets, selection);
  const auxErrors = useDatasetValues(auxErrorDatasets, selection);
  const axisValues = useDatasetValues(axisDatasets);

  return (
    <>{render({ title, signal, errors, auxValues, auxErrors, axisValues })}</>
  );
}

export default NxValuesFetcher;
