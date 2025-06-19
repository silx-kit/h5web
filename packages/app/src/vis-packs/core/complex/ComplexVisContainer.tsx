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
import { useComplexConfig } from './config';
import MappedComplexVis from './MappedComplexVis';

function ComplexVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertComplexType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const config = useComplexConfig();
  const heatmapConfig = useHeatmapConfig();
  const selection = getSliceSelection(dimMapping);

  return (
    <>
      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={dims}
        dimMapping={dimMapping}
        isCached={useValuesInCache(entity)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping} isSlice={selection !== undefined}>
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedComplexVis
              value={value}
              dims={dims}
              dimMapping={dimMapping}
              title={entity.name}
              toolbarContainer={toolbarContainer}
              config={config}
              heatmapConfig={heatmapConfig}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default ComplexVisContainer;
