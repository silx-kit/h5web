import { ReactElement, Suspense } from 'react';
import {
  assertBaseType,
  assertDataset,
  assertSimpleShape,
} from '../../../guards';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import type { VisContainerProps } from '../../models';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../hooks';
import ValueLoader from '../../../visualizer/ValueLoader';

function MatrixVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertBaseType(entity);

  const { dims } = entity.shape;
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
