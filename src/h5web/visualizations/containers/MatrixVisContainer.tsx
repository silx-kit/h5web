import React, { ReactElement } from 'react';
import { useDatasetValue } from './hooks';
import { assertDataset, assertSimpleShape } from '../../providers/utils';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import { VisContainerProps } from './models';

function MatrixVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);

  const value = useDatasetValue(entity.id);
  if (!value) {
    return <></>;
  }

  return <MappedMatrixVis value={value} dims={entity.shape.dims} />;
}

export default MatrixVisContainer;
