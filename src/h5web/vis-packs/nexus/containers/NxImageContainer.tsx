import { Suspense, useContext } from 'react';
import { assertGroup, assertMinDims } from '../../../guards';
import type { VisContainerProps } from '../../models';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import { useNxData } from '../hooks';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import ValueLoader from '../../../visualizer/ValueLoader';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../../../visualizer/ErrorFallback';
import { ProviderContext } from '../../../providers/context';
import { getSliceSelection } from '../../core/utils';

function NxImageContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);

  const { signalDataset, titleDataset, axisDatasets, silxStyle } = nxData;
  const { axisScaleTypes, signalScaleType } = silxStyle;
  assertMinDims(signalDataset, 2);

  const { shape: dims } = signalDataset;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const { valuesStore } = useContext(ProviderContext);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <ErrorBoundary
        resetKeys={[dimMapping]}
        FallbackComponent={ErrorFallback}
        onReset={() => {
          valuesStore.evict({
            path: signalDataset.path,
            selection: getSliceSelection(dimMapping),
          });
        }}
      >
        <Suspense fallback={<ValueLoader />}>
          <MappedHeatmapVis
            dataset={signalDataset}
            dims={dims}
            dimMapping={dimMapping}
            axisDatasets={axisDatasets}
            titleDataset={titleDataset}
            colorScaleType={signalScaleType}
            axisScaleTypes={axisScaleTypes}
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default NxImageContainer;
