import {
  assertDataset,
  assertNumericType,
  assertArrayShape,
} from '../../../guards';
import MappedLineVis from '../line/MappedLineVis';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import ValueLoader from '../../../visualizer/ValueLoader';
import { Suspense, useContext } from 'react';
import ErrorFallback from '../../../visualizer/ErrorFallback';
import { ErrorBoundary } from 'react-error-boundary';
import { ProviderContext } from '../../../providers/context';

function LineVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumericType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

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
        <Suspense fallback={<ValueLoader message="Loading entire dataset" />}>
          <MappedLineVis
            valueDataset={entity}
            dims={dims}
            dimMapping={dimMapping}
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default LineVisContainer;
