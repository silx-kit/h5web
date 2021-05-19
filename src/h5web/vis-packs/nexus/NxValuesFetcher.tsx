import type { ReactNode } from 'react';
import type { DimensionMapping } from '../../dimension-mapper/models';
import type { ComplexType, NumericType } from '../../providers/models';
import {
  useDatasetValue,
  useDatasetValues,
  usePrefetchValues,
} from '../core/hooks';
import { useAxisMapping } from './hooks';
import type { NxData, NxValues } from './models';

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

  const signal = useDatasetValue(signalDataset, dimMapping);
  const errors = useDatasetValue(errorsDataset);
  const axisMapping = useAxisMapping(axisDatasets, silxStyle.axisScaleTypes);
  const auxiliaries = Object.values(useDatasetValues(auxDatasets));
  const title = useDatasetValue(titleDataset);

  return <>{render({ signal, errors, axisMapping, auxiliaries, title })}</>;
}

export default NxValuesFetcher;
