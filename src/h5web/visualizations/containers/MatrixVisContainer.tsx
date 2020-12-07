import React, { ReactElement } from 'react';
import { useDatasetValue } from './hooks';
import { assertMyDataset, assertMySimpleShape } from '../../providers/utils';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import type { VisContainerProps } from './models';

function MatrixVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertMyDataset(entity);
  assertMySimpleShape(entity);

  const value = useDatasetValue(entity.id);
  if (!value) {
    return <></>;
  }

  return <MappedMatrixVis value={value} dims={entity.shape.dims} />;
}

export default MatrixVisContainer;
