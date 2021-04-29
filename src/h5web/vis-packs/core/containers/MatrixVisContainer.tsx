import React, { Suspense, useContext } from 'react';
import {
  assertPrintableType,
  assertDataset,
  assertArrayShape,
} from '../../../guards';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import type { VisContainerProps } from '../../models';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../hooks';
import ValueLoader from '../../../visualizer/ValueLoader';
import { ProviderContext } from '../../../providers/context';
import ErrorFallback from '../../../visualizer/ErrorFallback';
import { getSliceSelection } from '../utils';
import { ErrorBoundary } from 'react-error-boundary';

function MatrixVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertPrintableType(entity);

  const { shape: dims } = entity;
  const axesCount = Math.min(dims.length, 2);
  const [dimMapping, setDimMapping] = useDimMappingState(dims, axesCount);

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
          <MappedMatrixVis
            dataset={entity}
            dims={dims}
            dimMapping={dimMapping}
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default MatrixVisContainer;
