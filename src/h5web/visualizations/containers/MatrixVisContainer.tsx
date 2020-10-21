import React, { ReactElement, useState } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { useDatasetValue } from './hooks';
import { assertDataset } from '../../providers/utils';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import { VisContainerProps } from './models';

function MatrixVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity.id);

  const { dims } = entity.shape as HDF5SimpleShape;
  const [mapperState, setMapperState] = useState<DimensionMapping>(
    dims.length === 1 ? ['x'] : [...range(dims.length - 2).fill(0), 'y', 'x']
  );

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
      <MappedMatrixVis value={value} dims={dims} mapperState={mapperState} />
    </>
  );
}

export default MatrixVisContainer;
