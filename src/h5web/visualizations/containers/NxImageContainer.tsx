import { ReactElement, useEffect } from 'react';
import { assertGroup } from '../../guards';
import type { VisContainerProps } from './models';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import { useNxData } from '../nexus/hooks';
import { useHeatmapConfig } from '../heatmap/config';

function NxImageContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  const { signal, title, axisMapping } = nxData;

  const { dims } = signal;
  if (dims.length < 2) {
    throw new Error('Expected signal dataset with at least two dimensions');
  }

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
