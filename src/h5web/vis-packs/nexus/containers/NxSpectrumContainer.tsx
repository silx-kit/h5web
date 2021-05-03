import { Suspense, useContext } from 'react';
import { isEqual } from 'lodash-es';
import { assertGroup } from '../../../guards';
import MappedLineVis from '../../core/line/MappedLineVis';
import type { VisContainerProps } from '../../models';
import { useNxData } from '../hooks';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { ProviderContext } from '../../../providers/context';
import ValueLoader from '../../../visualizer/ValueLoader';
import { getDatasetLabel } from '../utils';

function NxSpectrumContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  const {
    auxDatasets,
    signalDataset,
    titleDataset,
    errorsDataset,
    axisDatasets,
    silxStyle,
  } = nxData;

  const { axisScaleTypes, signalScaleType } = silxStyle;
  const signalDims = signalDataset.shape;
  const errorsDims = errorsDataset?.shape;

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

  return (
    <>
      <DimensionMapper
        rawDims={signalDims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <Suspense fallback={<ValueLoader />}>
        <MappedLineVis
          valueDataset={signalDataset}
          valueLabel={getDatasetLabel(signalDataset)}
          valueScaleType={signalScaleType}
          errorsDataset={errorsDataset}
          auxDatasets={auxDatasets}
          dims={signalDims}
          dimMapping={dimMapping}
          titleDataset={titleDataset}
          axisDatasets={axisDatasets}
          axisScaleTypes={axisScaleTypes}
        />
      </Suspense>
    </>
  );
}

export default NxSpectrumContainer;
