import type { ReactElement } from 'react';
import { useDatasetValue } from '../hooks';
import {
  assertBaseType,
  assertDataset,
  assertSimpleShape,
} from '../../../guards';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import type { VisContainerProps } from '../../models';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../hooks';

function MatrixVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertBaseType(entity);

  const { dims } = entity.shape;
  const axesCount = Math.min(dims.length, 2);
  const [dimMapping, setDimMapping] = useDimMappingState(dims, axesCount);

  const value = useDatasetValue(entity);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <MappedMatrixVis value={value} dims={dims} dimMapping={dimMapping} />
    </>
  );
}

export default MatrixVisContainer;
