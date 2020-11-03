import React, { ReactElement, useState, useContext } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { assertGroup, isDataset } from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import MappedLineVis from '../line/MappedLineVis';
import { ProviderContext } from '../../providers/context';
import {
  getAttributeValue,
  getLinkedEntity,
  getNxDataGroup,
  getNxAxisMapping,
  getLinkedDatasets,
  getDatasetLabel,
  getNxAxesParams,
} from '../nexus/utils';
import { VisContainerProps } from './models';
import { assertStr } from '../shared/utils';
import { useDatasetValues } from './hooks';

function NxSpectrumContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const { metadata } = useContext(ProviderContext);

  const nxDataGroup = getNxDataGroup(entity, metadata);
  if (!nxDataGroup) {
    throw new Error('NXdata group not found');
  }

  const signalName = getAttributeValue(nxDataGroup, 'signal');
  assertStr(signalName);

  const signalDataset = getLinkedEntity(signalName, nxDataGroup, metadata);

  if (!signalDataset || !isDataset(signalDataset)) {
    throw new Error('Signal dataset not found');
  }

  const { dims } = signalDataset.shape as HDF5SimpleShape;
  if (dims.length === 0) {
    throw new Error('Expected dataset with at least one dimension');
  }

  const [dimensionMapping, setDimensionMapping] = useState<DimensionMapping>([
    ...range(dims.length - 1).fill(0),
    'x',
  ]);

  const nxAxisMapping = getNxAxisMapping(nxDataGroup);
  const axisDatasets = getLinkedDatasets(
    nxAxisMapping.filter((v): v is string => !!v),
    nxDataGroup,
    metadata
  );
  const datasetValues = useDatasetValues({
    [signalName]: signalDataset.id,
    ...Object.fromEntries(
      Object.entries(axisDatasets).map(([axis, dataset]) => [axis, dataset.id])
    ),
  });
  const nxAxesParams = getNxAxesParams(axisDatasets, datasetValues);

  if (!datasetValues || !datasetValues[signalName]) {
    return <></>;
  }

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimensionMapping}
        onChange={setDimensionMapping}
      />
      <MappedLineVis
        value={datasetValues[signalName]}
        valueLabel={getDatasetLabel(signalDataset, signalName)}
        axisMapping={nxAxisMapping}
        axesParams={nxAxesParams}
        dims={dims}
        dimensionMapping={dimensionMapping}
      />
    </>
  );
}

export default NxSpectrumContainer;
