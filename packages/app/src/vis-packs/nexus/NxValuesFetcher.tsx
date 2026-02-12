import {
  type ComplexType,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import { type ReactNode } from 'react';

import { useValue } from '../../hooks';
import { useNxValues, usePrefetchNxValues } from './hooks';
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

  usePrefetchNxValues([titleDataset, ...axisDatasets]);
  usePrefetchNxValues(
    [
      signalDef.dataset,
      signalDef.errorDataset,
      ...auxDatasets,
      ...auxErrorDatasets,
    ],
    selection,
  );

  const title = useValue(titleDataset) || signalDef.label;
  const signal = useValue(signalDef.dataset, selection);
  const errors = useValue(signalDef.errorDataset, selection);
  const auxValues = useNxValues(auxDatasets, selection);
  const auxErrors = useNxValues(auxErrorDatasets, selection);
  const axisValues = useNxValues(axisDatasets);

  return render({ title, signal, errors, auxValues, auxErrors, axisValues });
}

export default NxValuesFetcher;
