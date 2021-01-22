import type { ReactElement } from 'react';
import { useDatasetValue } from '../hooks';
import {
  assertDataset,
  assertNumericType,
  assertSimpleShape,
} from '../../../guards';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import type { VisContainerProps } from '../../models';

function HeatmapVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertNumericType(entity);

  const { dims } = entity.shape;
  if (dims.length < 2) {
    throw new Error('Expected dataset with at least two dimensions');
  }

  const value = useDatasetValue(entity.id);
  return <MappedHeatmapVis value={value} dims={dims} title={entity.name} />;
}

export default HeatmapVisContainer;
