import type { ReactElement } from 'react';
import { useDatasetValue } from '../hooks';
import { assertDataset, assertSimpleShape } from '../../../guards';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import type { VisContainerProps } from '../../models';

function MatrixVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);

  const { path, shape } = entity;
  const value = useDatasetValue(path);

  return <MappedMatrixVis value={value} dims={shape.dims} />;
}

export default MatrixVisContainer;
