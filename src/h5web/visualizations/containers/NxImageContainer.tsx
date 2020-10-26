import React, { ReactElement, useState, useContext } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { useDatasetValues } from './hooks';
import { assertGroup, isDataset } from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import { ProviderContext } from '../../providers/context';
import { getAttributeValue, getLinkedEntity, getNxAxes } from '../nexus/utils';
import { VisContainerProps } from './models';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import { assertStr } from '../shared/utils';

function NxImageContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const { metadata } = useContext(ProviderContext);
  const signal = getAttributeValue(entity, 'signal');
  assertStr(signal);
  const signalDataset = getLinkedEntity(entity, metadata, signal);

  if (!signalDataset || !isDataset(signalDataset)) {
    throw new Error('Signal dataset not found');
  }

  const { dims } = signalDataset.shape as HDF5SimpleShape;
  if (dims.length < 2) {
    throw new Error('Expected signal dataset with at least two dimensions');
  }

  const [mapperState, setMapperState] = useState<DimensionMapping>([
    ...range(dims.length - 2).fill(0),
    'y',
    'x',
  ]);

  const axes = getNxAxes(entity, metadata);

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
      <MappedHeatmapVis
        value={values.signal}
        valueLabel={signal}
        dims={dims}
        mapperState={mapperState}
        axesLabels={axes.labels}
        axesValues={values}
      />
    </>
  );
}

export default NxImageContainer;
