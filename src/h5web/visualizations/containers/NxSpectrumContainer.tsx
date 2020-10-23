import React, { ReactElement, useState, useContext } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape, HDF5Id } from '../../providers/models';
import { useDatasetValues } from './hooks';
import { assertGroup, isDataset } from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import MappedLineVis from '../line/MappedLineVis';
import { ProviderContext } from '../../providers/context';
import {
  getAttributeValue,
  getLinkedEntity,
  getAxesLabels,
} from '../nexus/utils';
import { VisContainerProps } from './models';
import { assertStr } from '../shared/utils';

function NxSpectrumContainer(props: VisContainerProps): ReactElement {
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
  if (dims.length < 1) {
    throw new Error('Expected dataset with at least one dimension');
  }

  const axesLabels = getAxesLabels(entity);

  const axesIds = axesLabels.reduce<Record<string, HDF5Id>>((acc, axis) => {
    if (!axis) {
      return acc;
    }

    const dataset = getLinkedEntity(entity, metadata, axis);
    if (dataset && isDataset(dataset)) {
      acc[axis] = dataset.id;
    }
    return acc;
  }, {});

  const [mapperState, setMapperState] = useState<DimensionMapping>([
    ...range(dims.length - 1).fill(0),
    'x',
  ]);

  const values = useDatasetValues({ signal: signalDataset.id, ...axesIds });

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
        axesLabels={axesLabels}
        axesValues={values}
        dims={dims}
        mapperState={mapperState}
      />
    </>
  );
}

export default NxSpectrumContainer;
