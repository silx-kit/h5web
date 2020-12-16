import React, { ReactElement } from 'react';
import { useDatasetValue } from './hooks';
import {
  assertDataset,
  assertNumericType,
  assertSimpleShape,
} from '../../guards';
import MappedLineVis from '../line/MappedLineVis';
import type { VisContainerProps } from './models';

function LineVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertNumericType(entity);

  const value = useDatasetValue(entity.id);

  return (
    <MappedLineVis value={value} dims={entity.shape.dims} title={entity.name} />
  );
}

export default LineVisContainer;
