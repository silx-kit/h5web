import type { NumericType, ComplexType } from '@h5web/shared';
import type { ReactNode } from 'react';
import { useContext } from 'react';

import { ProviderContext } from '../../providers/context';
import { useDatasetValue, usePrefetchValues } from '../core/hooks';
import { useAuxiliaries, useAxisMapping } from './hooks';
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
    errorsDataset,
    axisDatasets,
    auxDatasets,
    titleDataset,
    silxStyle,
  } = nxData;

  usePrefetchValues([signalDataset, errorsDataset, ...auxDatasets], selection);
  usePrefetchValues([...axisDatasets, titleDataset]);

  const { attrValuesStore } = useContext(ProviderContext);
  const signal = useDatasetValue(signalDataset, selection);
  const signalLabel = getDatasetLabel(signalDataset, attrValuesStore);
  const errors = useDatasetValue(errorsDataset, selection);
  const axisMapping = useAxisMapping(axisDatasets, silxStyle.axisScaleTypes);
  const auxiliaries = useAuxiliaries(auxDatasets, selection);
  const title = useDatasetValue(titleDataset) || signalLabel;

  return (
    <>
      {render({
        signal,
        signalLabel,
        errors,
        axisMapping,
        auxiliaries,
        title,
      })}
    </>
  );
}

export default NxValuesFetcher;
