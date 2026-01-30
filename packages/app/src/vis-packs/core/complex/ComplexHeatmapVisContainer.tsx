import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import {
  assertArrayShape,
  assertComplexType,
  assertDataset,
  assertMinDims,
} from '@h5web/shared/guards';

import { useDimMappingState } from '../../../dim-mapping-store';
import { useValuesInCache } from '../../../hooks';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { useHeatmapConfig } from '../heatmap/config';
import ValueFetcher from '../ValueFetcher';
import MappedComplexHeatmapVis from './MappedComplexHeatmapVis';

function ComplexHeatmapVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertComplexType(entity);

  const { dims } = entity.shape;
  const [dimMapping, setDimMapping] = useDimMappingState({
    dims,
    axesCount: 2,
  });

  const config = useHeatmapConfig();
  const selection = getSliceSelection(dimMapping);

  return (
    <>
      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={dims}
        dimMapping={dimMapping}
        canSliceFast={useValuesInCache(entity)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping} isSlice={selection !== undefined}>
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedComplexHeatmapVis
              value={value}
              dims={dims}
              dimMapping={dimMapping}
              title={entity.name}
              toolbarContainer={toolbarContainer}
              config={config}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default ComplexHeatmapVisContainer;
