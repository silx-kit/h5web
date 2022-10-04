import { assertGroup, assertMinDims } from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import { useHeatmapConfig } from '../../core/heatmap/config';
import { getSliceSelection } from '../../core/utils';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { useNxData } from '../hooks';
import { assertNumericSignal } from '../utils';

function NxImageContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericSignal(nxData);

  const { signalDataset, axisLabels, silxStyle } = nxData;
  assertMinDims(signalDataset, 2);

  const { shape: dims } = signalDataset;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const config = useHeatmapConfig({ scaleType: silxStyle.signalScaleType });

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxData}
          selection={getSliceSelection(dimMapping)}
          render={(nxValues) => {
            const { signal, axisValues, title } = nxValues;

            return (
              <MappedHeatmapVis
                dataset={signalDataset}
                value={signal}
                dimMapping={dimMapping}
                axisLabels={axisLabels}
                axisValues={axisValues}
                title={title}
                toolbarContainer={toolbarContainer}
                config={config}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxImageContainer;
