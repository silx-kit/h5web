import React, { ReactElement, useState, useContext, useEffect } from 'react';
import { range } from 'lodash-es';
import { assertGroup } from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import { ProviderContext } from '../../providers/context';
import { findNxDataGroup } from '../nexus/utils';
import { VisContainerProps } from './models';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import { useNxData } from '../nexus/hooks';
import { useHeatmapConfig } from '../heatmap/config';
import { assertDefined } from '../shared/utils';

function NxImageContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const { metadata } = useContext(ProviderContext);
  const nxDataGroup = findNxDataGroup(entity, metadata);
  assertDefined(nxDataGroup, 'Expected to find NXdata group');

  const nxData = useNxData(nxDataGroup, metadata);

  const { dims } = nxData.signal;
  if (dims.length < 2) {
    throw new Error('Expected signal dataset with at least two dimensions');
  }

  const [dimensionMapping, setDimensionMapping] = useState<DimensionMapping>([
    ...range(dims.length - 2).fill(0),
    'y',
    'x',
  ]);

  const { signal, title, axisMapping } = nxData;

  const { setScaleType } = useHeatmapConfig();

  useEffect(() => {
    if (signal.scaleType) {
      setScaleType(signal.scaleType);
    }
  }, [setScaleType, signal.scaleType]);

  if (!signal.value) {
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
        value={signal.value}
        title={title || signal.label}
        dims={dims}
        dimensionMapping={dimensionMapping}
        axisMapping={axisMapping}
      />
    </>
  );
}

export default NxImageContainer;
