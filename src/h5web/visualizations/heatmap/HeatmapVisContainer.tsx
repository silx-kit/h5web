import React, { ReactElement, useState } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { useDatasetValue } from '../shared/hooks';
import { assertDataset } from '../../providers/utils';
import DimensionMapper from '../../dataset-visualizer/mapper/DimensionMapper';
import { DimensionMapping } from '../../dataset-visualizer/models';
import MappedHeatmapVis from './MappedHeatmapVis';
import { VisContainerProps } from '../shared/models';

function HeatmapVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity.id);

  const { dims } = entity.shape as HDF5SimpleShape;
  if (dims.length < 2) {
    throw new Error('Expected dataset with at least two dimensions');
  }

  const [mapperState, setMapperState] = useState<DimensionMapping>([
    ...range(dims.length - 2).fill(0),
    'y',
    'x',
  ]);

  if (!value) {
    return <></>;
  }

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={mapperState}
        onChange={setMapperState}
      />
      <MappedHeatmapVis
        value={value}
        dataset={entity}
        mapperState={mapperState}
      />
    </>
  );
}

export default HeatmapVisContainer;
