import { ReactElement, useContext, useEffect } from 'react';
import { assertDefined, assertGroup } from '../../guards';
import { findNxDataGroup } from '../nexus/utils';
import type { VisContainerProps } from './models';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import { useNxData } from '../nexus/hooks';
import { useHeatmapConfig } from '../heatmap/config';
import { ProviderContext } from '../../providers/context';

function NxImageContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const { metadata } = useContext(ProviderContext);
  const nxDataGroup = findNxDataGroup(entity, metadata);
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
