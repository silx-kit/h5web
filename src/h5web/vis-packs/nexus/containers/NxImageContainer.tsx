import { ReactElement, useEffect } from 'react';
import { assertArray, assertGroup, assertOptionalStr } from '../../../guards';
import type { VisContainerProps } from '../../models';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import { useHeatmapConfig } from '../../core/heatmap/config';
import { useAxisMapping, useNxData } from '../hooks';
import { useDatasetValue } from '../../core/hooks';
import { getDatasetLabel } from '../utils';

function NxImageContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  const { signalDataset, titleDataset, axisDatasetMapping, silxStyle } = nxData;
  const { axesScaleType, signalScaleType } = silxStyle;

  const { dims } = signalDataset.shape;
  if (dims.length < 2) {
    throw new Error('Expected signal dataset with at least two dimensions');
  }

  const value = useDatasetValue(signalDataset.path);
  assertArray<number>(value);

  const title = useDatasetValue(titleDataset?.path);
  assertOptionalStr(title);

  const axisMapping = useAxisMapping(axisDatasetMapping, axesScaleType);

  const { setScaleType } = useHeatmapConfig();
  useEffect(() => {
    if (signalScaleType) {
      setScaleType(signalScaleType);
    }
  }, [setScaleType, signalScaleType]);

  return (
    <MappedHeatmapVis
      value={value}
      title={title || getDatasetLabel(signalDataset)}
      dims={dims}
      axisMapping={axisMapping}
    />
  );
}

export default NxImageContainer;
