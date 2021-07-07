import {
  assertGroupWithChildren,
  assertMinDims,
  assertNumericType,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import { useDimMappingState } from '../../hooks';
import VisBoundary from '../../core/VisBoundary';
import NxValuesFetcher from '../NxValuesFetcher';
import { getNxData, getDatasetLabel } from '../utils';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

function NxImageContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroupWithChildren(entity);

  const nxData = getNxData(entity);
  const { signalDataset, silxStyle } = nxData;
  assertNumericType(signalDataset);
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
                value={signal as number[]}
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
