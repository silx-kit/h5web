import { Suspense } from 'react';
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

function MatrixVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertPrintableType(entity);

  const { shape: dims } = entity;
  const axesCount = Math.min(dims.length, 2);
  const [dimMapping, setDimMapping] = useDimMappingState(dims, axesCount);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <Suspense fallback={<ValueLoader />}>
        <MappedMatrixVis dataset={entity} dims={dims} dimMapping={dimMapping} />
      </Suspense>
    </>
  );
}

export default MatrixVisContainer;
