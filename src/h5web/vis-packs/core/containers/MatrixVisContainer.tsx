import type { ReactElement } from 'react';
import { useDatasetValue } from '../hooks';
import { assertDataset, assertSimpleShape } from '../../../guards';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import type { VisContainerProps } from '../../models';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../hooks';

function MatrixVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);

  const { path, shape } = entity;
  const { dims } = shape;

  const axesCount = Math.min(dims.length, 2);
  const [dimMapping, setDimMapping] = useDimMappingState(dims, axesCount);

  const value = useDatasetValue(path);

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
