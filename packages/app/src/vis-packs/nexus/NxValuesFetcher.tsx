import type { NumericType, ComplexType } from '@h5web/shared';
import type { ReactNode } from 'react';
import { useContext } from 'react';

import type { DimensionMapping } from '../../dimension-mapper/models';
import { ProviderContext } from '../../providers/context';
import {
  useDatasetValue,
  useDatasetValues,
  usePrefetchValues,
} from '../core/hooks';
import { useAxisMapping } from './hooks';
import type { NxData, NxValues } from './models';
import { getDatasetLabel } from './utils';

interface Props<T extends NumericType | ComplexType> {
  nxData: NxData<T>;
  dimMapping?: DimensionMapping; // for slice-by-slice fetching
  render: (val: NxValues<T>) => ReactNode;
}

function NxValuesFetcher<T extends NumericType | ComplexType>(props: Props<T>) {
  const { nxData, dimMapping, render } = props;
  const {
    signalDataset,
    errorsDataset,
    axisDatasets,
    auxDatasets,
    titleDataset,
    silxStyle,
  } = nxData;

  usePrefetchValues([signalDataset, errorsDataset, ...auxDatasets], dimMapping);
  usePrefetchValues([...axisDatasets, titleDataset]);

  const { attrValuesStore } = useContext(ProviderContext);
  const signal = useDatasetValue(signalDataset, dimMapping);
  const signalLabel = getDatasetLabel(signalDataset, attrValuesStore);
  const errors = useDatasetValue(errorsDataset);
  const axisMapping = useAxisMapping(axisDatasets, silxStyle.axisScaleTypes);
  const auxiliaries = Object.values(useDatasetValues(auxDatasets));
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
