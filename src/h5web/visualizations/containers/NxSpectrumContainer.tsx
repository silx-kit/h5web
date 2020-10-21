import React, { ReactElement, useState, useContext } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { useDatasetValue } from './hooks';
import { assertGroup } from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import MappedLineVis from '../line/MappedLineVis';
import { ProviderContext } from '../../providers/context';
import { getSignalDataset } from '../nexus/utils';
import { VisContainerProps } from './models';

function NxSpectrumContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const { metadata } = useContext(ProviderContext);
  const dataset = getSignalDataset(entity, metadata);

  if (!dataset) {
    throw new Error('Signal dataset not found');
  }

  const { dims } = dataset.shape as HDF5SimpleShape;
  if (dims.length < 1) {
    throw new Error('Expected dataset with at least one dimension');
  }

  const [mapperState, setMapperState] = useState<DimensionMapping>([
    ...range(dims.length - 1).fill(0),
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
      <MappedLineVis
        value={value}
        dataset={dataset}
        mapperState={mapperState}
      />
    </>
  );
}

export default NxSpectrumContainer;
