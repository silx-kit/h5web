import {
  assertDefined,
  isBigIntArray,
  isBigIntTypedArray,
} from '@h5web/shared/guards';
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
  const rawAxisValues = useDatasetsValues(axisDatasets);

  const axisValues = rawAxisValues.map((value, i) => {
    if (!value || isBigIntArray(value) || isBigIntTypedArray(value)) {
      return value;
    }

    assertDefined(axisDefs[i]);
    const { scalingFactor, offset } = axisDefs[i];
    if (scalingFactor === undefined || offset === undefined) {
      return value;
    }

    return value.map((v) => scalingFactor * v + offset);
  });

  return render({ title, signal, errors, auxValues, auxErrors, axisValues });
}

export default NxValuesFetcher;
