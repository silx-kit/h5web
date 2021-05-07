import { Suspense, useContext } from 'react';
import {
  assertDataset,
  assertMinDims,
  assertArrayShape,
  assertComplexType,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import ValueLoader from '../../../visualizer/ValueLoader';
import MappedComplexVis from '../complex/MappedComplexVis';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../../../visualizer/ErrorFallback';
import { getSliceSelection } from '../utils';
import { ProviderContext } from '../../../providers/context';

function ComplexVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertComplexType(entity);

  const { name, shape: dims } = entity;
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
            path: entity.path,
            selection: getSliceSelection(dimMapping),
          });
        }}
      >
        <Suspense fallback={<ValueLoader message="Loading current slice" />}>
          <MappedComplexVis
            dataset={entity}
            dims={dims}
            dimMapping={dimMapping}
            title={name}
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default ComplexVisContainer;
