import type { ReactElement } from 'react';
import { useDatasetValue } from './hooks';
import { assertDataset, assertSimpleShape } from '../../guards';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import type { VisContainerProps } from './models';

function MatrixVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);

  const value = useDatasetValue(entity.id);
  return <MappedMatrixVis value={value} dims={entity.shape.dims} />;
}

export default MatrixVisContainer;
