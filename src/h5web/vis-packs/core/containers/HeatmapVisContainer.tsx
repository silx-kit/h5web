import type { ReactElement } from 'react';
import { useDatasetValue } from '../hooks';
import {
  assertDataset,
  assertNumericType,
  assertSimpleShape,
} from '../../../guards';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

function HeatmapVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertNumericType(entity);

  const { name, shape } = entity;
  const { dims } = shape;

  if (dims.length < 2) {
    throw new Error('Expected dataset with at least two dimensions');
  }

  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const value = useDatasetValue(entity);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <MappedHeatmapVis
        value={value}
        dims={dims}
        dimMapping={dimMapping}
        title={name}
      />
    </>
  );
}

export default HeatmapVisContainer;
