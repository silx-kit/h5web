import type { NumericType, ComplexType } from '@h5web/shared';
import type { ReactNode } from 'react';

import { useDataContext } from '../../providers/DataProvider';
import { useDatasetValue, usePrefetchValues } from '../core/hooks';
import { useAuxiliaries, useAxisValues } from './hooks';
import type { NxData, NxValues } from './models';
import { getDatasetLabel } from './utils';

interface Props<T extends NumericType | ComplexType> {
  nxData: NxData<T>;
  selection?: string; // for slice-by-slice fetching
  render: (val: NxValues<T>) => ReactNode;
}

function NxValuesFetcher<T extends NumericType | ComplexType>(props: Props<T>) {
  const { nxData, selection, render } = props;
  const {
    signalDataset,
    errorDataset,
    axisDatasets,
    auxDatasets,
    titleDataset,
  } = nxData;

  usePrefetchValues(
    [
      signalDataset,
      errorDataset,
      ...auxDatasets.flatMap((d) => [d.signal, d.errors]),
    ],
    selection
  );
  usePrefetchValues([...axisDatasets, titleDataset]);

  const { attrValuesStore } = useDataContext();
  const signal = useDatasetValue(signalDataset, selection);
  const signalLabel = getDatasetLabel(signalDataset, attrValuesStore);
  const errors = useDatasetValue(errorDataset, selection);
  const axisValues = useAxisValues(axisDatasets);
  const auxiliaries = useAuxiliaries(auxDatasets, selection);
  const title = useDatasetValue(titleDataset) || signalLabel;

  return (
    <>
      {render({ signal, signalLabel, errors, axisValues, auxiliaries, title })}
    </>
  );
}

export default NxValuesFetcher;
