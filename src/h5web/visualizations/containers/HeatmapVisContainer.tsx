import React, { ReactElement } from 'react';
import { useDatasetValue } from './hooks';
import {
  assertMyDataset,
  assertMyNumericType,
  assertMySimpleShape,
} from '../../providers/utils';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import type { VisContainerProps } from './models';

function HeatmapVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertMyDataset(entity);
  assertMySimpleShape(entity);
  assertMyNumericType(entity);

  const { dims } = entity.shape;
  if (dims.length < 2) {
    throw new Error('Expected dataset with at least two dimensions');
  }

  const value = useDatasetValue(entity.id);
  if (!value) {
    return <></>;
  }

  return <MappedHeatmapVis value={value} dims={dims} title={entity.name} />;
}

export default HeatmapVisContainer;
