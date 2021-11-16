import { assertGroupWithChildren, assertMinDims } from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { useNxData } from '../hooks';
import { getDatasetLabel, assertNumericSignal } from '../utils';

function NxImageContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroupWithChildren(entity);

  const nxData = useNxData(entity);
  assertNumericSignal(nxData);

  const { signalDataset, silxStyle } = nxData;
  assertMinDims(signalDataset, 2);

  const { shape: dims } = signalDataset;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

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
          dimMapping={dimMapping}
          render={(nxValues) => {
            const { signal, axisMapping, title } = nxValues;
            return (
              <MappedHeatmapVis
                value={signal}
                dims={dims}
                dimMapping={dimMapping}
                axisMapping={axisMapping}
                title={title || getDatasetLabel(signalDataset)}
                colorScaleType={silxStyle.signalScaleType}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxImageContainer;
