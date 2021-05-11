import type { ReactNode } from 'react';
import type { DimensionMapping } from '../../dimension-mapper/models';
import { useDatasetValue, useDatasetValues } from '../core/hooks';
import { useAxisMapping } from './hooks';
import type { NxData, NxValues } from './models';

interface Props {
  nxData: NxData;
  dimMapping?: DimensionMapping; // for slice-by-slice fetching
  render: (val: NxValues) => ReactNode;
}

function NxValuesFetcher(props: Props) {
  const { nxData, dimMapping, render } = props;
  const {
    signalDataset,
    errorsDataset,
    axisDatasets,
    auxDatasets,
    titleDataset,
    silxStyle,
  } = nxData;

  const signal = useDatasetValue(signalDataset, dimMapping);
  const errors = useDatasetValue(errorsDataset);
  const axisMapping = useAxisMapping(axisDatasets, silxStyle.axisScaleTypes);
  const auxiliaries = Object.values(useDatasetValues(auxDatasets));
  const title = useDatasetValue(titleDataset);

  return <>{render({ signal, errors, axisMapping, auxiliaries, title })}</>;
}

export default NxValuesFetcher;
