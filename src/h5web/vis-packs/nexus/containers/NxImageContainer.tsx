import { ReactElement, useEffect } from 'react';
import { assertArray, assertGroup, assertOptionalStr } from '../../../guards';
import type { VisContainerProps } from '../../models';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import { useHeatmapConfig } from '../../core/heatmap/config';
import { useAxisMapping, useNxData } from '../hooks';
import { useDatasetValue } from '../../core/hooks';
import { getDatasetLabel } from '../utils';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

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

  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const value = useDatasetValue(signalDataset);
  assertArray<number>(value);

  const title = useDatasetValue(titleDataset);
  assertOptionalStr(title);

  const axisMapping = useAxisMapping(axisDatasetMapping, axesScaleType);

  const { setScaleType } = useHeatmapConfig();
  useEffect(() => {
    if (signalScaleType) {
      setScaleType(signalScaleType);
    }
  }, [setScaleType, signalScaleType]);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <MappedHeatmapVis
        value={value}
        dims={dims}
        dimMapping={dimMapping}
        axisMapping={axisMapping}
        title={title || getDatasetLabel(signalDataset)}
      />
    </>
  );
}

export default NxImageContainer;
