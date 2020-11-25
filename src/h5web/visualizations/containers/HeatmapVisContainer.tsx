import React, { ReactElement } from 'react';
import { useDatasetValue } from './hooks';
import {
  assertDataset,
  assertNumericType,
  assertSimpleShape,
} from '../../providers/utils';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import { VisContainerProps } from './models';

function HeatmapVisContainer(props: VisContainerProps): ReactElement {
  const { entity, entityName } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertNumericType(entity);

  const { dims } = entity.shape;
  if (dims.length < 2) {
    throw new Error('Expected dataset with at least two dimensions');
  }

  const value = useDatasetValue(entity.id);
  if (!value) {
    return <></>;
  }

  return <MappedHeatmapVis value={value} dims={dims} title={entityName} />;
}

export default HeatmapVisContainer;
