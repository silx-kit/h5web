import { ReactElement, Suspense, useEffect } from 'react';
import { assertGroup, assertMinDims } from '../../../guards';
import type { VisContainerProps } from '../../models';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import { useHeatmapConfig } from '../../core/heatmap/config';
import { useAxisMapping, useNxData } from '../hooks';
import { useDatasetValue } from '../../core/hooks';
import { getDatasetLabel } from '../utils';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import ValueLoader from '../../../visualizer/ValueLoader';

function NxImageContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);

  const { signalDataset, titleDataset, axisDatasetMapping, silxStyle } = nxData;
  const { axesScaleType, signalScaleType } = silxStyle;
  assertMinDims(signalDataset, 2);

  const { dims } = signalDataset.shape;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const title = useDatasetValue(titleDataset);
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
      <Suspense fallback={<ValueLoader />}>
        <MappedHeatmapVis
          dataset={signalDataset}
          dims={dims}
          dimMapping={dimMapping}
          axisMapping={axisMapping}
          title={title || getDatasetLabel(signalDataset)}
        />
      </Suspense>
    </>
  );
}

export default NxImageContainer;
