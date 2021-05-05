import { Suspense, useContext } from 'react';
import {
  assertDataset,
  assertMinDims,
  assertNumericType,
  assertArrayShape,
} from '../../../guards';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import ValueLoader from '../../../visualizer/ValueLoader';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../../../visualizer/ErrorFallback';
import { ProviderContext } from '../../../providers/context';

function HeatmapVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertNumericType(entity);

  const { shape: dims } = entity;
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
        <Suspense fallback={<ValueLoader message="Loading current slice" />}>
          <MappedHeatmapVis
            dataset={entity}
            dims={dims}
            dimMapping={dimMapping}
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default HeatmapVisContainer;
