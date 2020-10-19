import React, { ReactElement, useState, useContext } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { useDatasetValue } from '../shared/hooks';
import { assertGroup } from '../../providers/utils';
import DimensionMapper from '../../dataset-visualizer/mapper/DimensionMapper';
import { DimensionMapping } from '../../dataset-visualizer/models';
import { ProviderContext } from '../../providers/context';
import { getSignalDataset } from './utils';
import { VisContainerProps } from '../shared/models';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';

function NxImageContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const { metadata } = useContext(ProviderContext);
  const dataset = getSignalDataset(entity, metadata);

  if (!dataset) {
    throw new Error('Signal dataset not found');
  }

  const { dims } = dataset.shape as HDF5SimpleShape;
  if (dims.length < 2) {
    throw new Error('Expected dataset with at least two dimensions');
  }

  const [mapperState, setMapperState] = useState<DimensionMapping>([
    ...range(dims.length - 2).fill(0),
    'y',
    'x',
  ]);

  const value = useDatasetValue(dataset.id);

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
        dataset={dataset}
        mapperState={mapperState}
      />
    </>
  );
}

export default NxImageContainer;
