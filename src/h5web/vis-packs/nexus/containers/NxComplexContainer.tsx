import { Suspense, useContext } from 'react';
import { assertComplexType, assertGroup, assertMinDims } from '../../../guards';
import type { VisContainerProps } from '../../models';
import { useNxData } from '../hooks';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import ValueLoader from '../../../visualizer/ValueLoader';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../../../visualizer/ErrorFallback';
import { ProviderContext } from '../../../providers/context';
import MappedComplexVis from '../../core/complex/MappedComplexVis';

function NxComplexContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);

  const { signalDataset, titleDataset, axisDatasets, silxStyle } = nxData;
  const { axisScaleTypes, signalScaleType } = silxStyle;
  assertComplexType(signalDataset);
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
        onError={() => valuesStore.evictCancelled()}
      >
        <Suspense fallback={<ValueLoader />}>
          <MappedComplexVis
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

export default NxComplexContainer;
