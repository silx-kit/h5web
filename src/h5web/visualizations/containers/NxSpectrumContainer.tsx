import React, { ReactElement, useState, useContext } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { useDatasetValues } from './hooks';
import { assertGroup, isDataset } from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import MappedLineVis from '../line/MappedLineVis';
import { ProviderContext } from '../../providers/context';
import {
  getAttributeValue,
  getLinkedEntity,
  getNxAxes,
  getNxDataGroup,
} from '../nexus/utils';
import { VisContainerProps } from './models';
import { assertStr } from '../shared/utils';

function NxSpectrumContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const { metadata } = useContext(ProviderContext);

  const nxDataGroup = getNxDataGroup(entity, metadata);
  if (!nxDataGroup) {
    throw new Error('NXdata group not found');
  }

  const signal = getAttributeValue(nxDataGroup, 'signal');
  assertStr(signal);
  const signalDataset = getLinkedEntity(nxDataGroup, metadata, signal);

  if (!signalDataset || !isDataset(signalDataset)) {
    throw new Error('Signal dataset not found');
  }

  const { dims } = signalDataset.shape as HDF5SimpleShape;
  if (dims.length < 1) {
    throw new Error('Expected dataset with at least one dimension');
  }

  const axes = getNxAxes(nxDataGroup, metadata);

  const [mapperState, setMapperState] = useState<DimensionMapping>([
    ...range(dims.length - 1).fill(0),
    'x',
  ]);

  const values = useDatasetValues({ signal: signalDataset.id, ...axes.ids });

  if (!values || !values.signal) {
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
        value={values.signal}
        valueLabel={signal}
        axesLabels={axes.labels}
        axesValues={values}
        dims={dims}
        mapperState={mapperState}
      />
    </>
  );
}

export default NxSpectrumContainer;
