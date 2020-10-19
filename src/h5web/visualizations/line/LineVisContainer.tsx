import React, { ReactElement, useState } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { useDatasetValue } from '../shared/hooks';
import { assertDataset } from '../../providers/utils';
import DimensionMapper from '../../dataset-visualizer/mapper/DimensionMapper';
import { DimensionMapping } from '../../dataset-visualizer/models';
import MappedLineVis from './MappedLineVis';
import { VisContainerProps } from '../shared/models';

function LineVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity.id);

  const { dims } = entity.shape as HDF5SimpleShape;
  if (dims.length < 1) {
    throw new Error('Expected dataset with at least one dimension');
  }

  const [mapperState, setMapperState] = useState<DimensionMapping>([
    ...range(dims.length - 1).fill(0),
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
      <MappedLineVis value={value} dataset={entity} mapperState={mapperState} />
    </>
  );
}

export default LineVisContainer;
