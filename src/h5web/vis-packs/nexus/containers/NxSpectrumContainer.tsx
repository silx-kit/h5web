import { useContext } from 'react';
import { isEqual } from 'lodash-es';
import { assertGroup } from '../../../guards';
import { useDatasetValue } from '../../core/hooks';
import MappedLineVis from '../../core/line/MappedLineVis';
import type { VisContainerProps } from '../../models';
import { useAxisMapping, useNxData } from '../hooks';
import { getDatasetLabel } from '../utils';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { ProviderContext } from '../../../providers/context';

function NxSpectrumContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  const {
    auxDatasets,
    signalDataset,
    titleDataset,
    errorsDataset,
    axisDatasetMapping,
    silxStyle,
  } = nxData;

  const signalLabel = getDatasetLabel(signalDataset);
  const { axesScaleType, signalScaleType } = silxStyle;
  const signalDims = signalDataset.shape.dims;
  const errorsDims = errorsDataset?.shape.dims;

  if (errorsDims && !isEqual(signalDims, errorsDims)) {
    const dimsStr = JSON.stringify({ signalDims, errorsDims });
    throw new Error(`Signal and errors dimensions don't match: ${dimsStr}`);
  }

  const [dimMapping, setDimMapping] = useDimMappingState(signalDims, 1);

  const { valuesStore } = useContext(ProviderContext);
  valuesStore.prefetch({ path: signalDataset.path });
  if (errorsDataset) {
    valuesStore.prefetch({ path: errorsDataset.path });
  }

  const title = useDatasetValue(titleDataset);
  const axisMapping = useAxisMapping(axisDatasetMapping, axesScaleType);

  return (
    <>
      <DimensionMapper
        rawDims={signalDims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <MappedLineVis
        valueDataset={signalDataset}
        valueLabel={signalLabel}
        valueScaleType={signalScaleType}
        errorsDataset={errorsDataset}
        auxDatasets={auxDatasets}
        dims={signalDims}
        dimMapping={dimMapping}
        axisMapping={axisMapping}
        title={title || signalLabel}
      />
    </>
  );
}

export default NxSpectrumContainer;
