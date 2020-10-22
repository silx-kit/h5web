import React, { ReactElement, useState } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { useDatasetValue } from './hooks';
import { assertDataset } from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import MappedLineVis from '../line/MappedLineVis';
import { VisContainerProps } from './models';

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
      <MappedLineVis value={value} dims={dims} mapperState={mapperState} />
    </>
  );
}

export default LineVisContainer;
