import React, { ReactElement, useEffect } from 'react';
import { assertMyGroup } from '../../providers/utils';
import { findMyNxDataGroup } from '../nexus/utils';
import type { VisContainerProps } from './models';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import { useNxData } from '../nexus/hooks';
import { useHeatmapConfig } from '../heatmap/config';
import { assertDefined } from '../shared/utils';

function NxImageContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertMyGroup(entity);

  const nxDataGroup = findMyNxDataGroup(entity);
  assertDefined(nxDataGroup, 'Expected to find NXdata group');

  const nxData = useNxData(nxDataGroup);

  const { dims } = nxData.signal;
  if (dims.length < 2) {
    throw new Error('Expected signal dataset with at least two dimensions');
  }

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
    <MappedHeatmapVis
      value={signal.value}
      title={title || signal.label}
      dims={dims}
      axisMapping={axisMapping}
    />
  );
}

export default NxImageContainer;
