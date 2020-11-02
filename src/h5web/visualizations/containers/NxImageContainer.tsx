import React, { ReactElement, useState, useContext } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { assertGroup, isDataset } from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import { ProviderContext } from '../../providers/context';
import {
  getAttributeValue,
  getLinkedEntity,
  getNxDataGroup,
  getNxAxisMapping,
  getLinkedDatasets,
  getNxAxesParams,
  getDatasetLabel,
} from '../nexus/utils';
import { VisContainerProps } from './models';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import { assertStr } from '../shared/utils';
import { useDatasetValues } from './hooks';

function NxImageContainer(props: VisContainerProps): ReactElement {
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
  if (dims.length < 2) {
    throw new Error('Expected signal dataset with at least two dimensions');
  }

  const [dimensionMapping, setDimensionMapping] = useState<DimensionMapping>([
    ...range(dims.length - 2).fill(0),
    'y',
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
      <MappedHeatmapVis
        value={datasetValues[signalName]}
        title={getDatasetLabel(signalDataset, signalName)}
        dims={dims}
        dimensionMapping={dimensionMapping}
        axisMapping={nxAxisMapping}
        axesParams={nxAxesParams}
      />
    </>
  );
}

export default NxImageContainer;
