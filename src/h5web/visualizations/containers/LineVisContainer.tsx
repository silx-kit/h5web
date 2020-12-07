import React, { ReactElement } from 'react';
import { useDatasetValue } from './hooks';
import {
  assertDataset,
  assertNumericType,
  assertMySimpleShape,
} from '../../providers/utils';
import MappedLineVis from '../line/MappedLineVis';
import type { VisContainerProps } from './models';

function LineVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertMySimpleShape(entity);
  assertNumericType(entity);

  const value = useDatasetValue(entity.id);
  if (!value) {
    return <></>;
  }

  return (
    <MappedLineVis value={value} dims={entity.shape.dims} title={entity.name} />
  );
}

export default LineVisContainer;
