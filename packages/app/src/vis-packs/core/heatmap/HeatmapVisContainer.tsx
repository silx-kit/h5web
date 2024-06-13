import {
  assertArrayShape,
  assertDataset,
  assertMinDims,
  assertNumericLikeType,
} from '@h5web/shared/guards';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { useIgnoreFillValue, useValuesCached } from '../hooks';
import { getSliceSelection } from '../utils';
import ValueFetcher from '../ValueFetcher';
import { useHeatmapConfig } from './config';
import MappedHeatmapVis from './MappedHeatmapVis';

function HeatmapVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertNumericLikeType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const config = useHeatmapConfig();

  const selection = getSliceSelection(dimMapping);
  const ignoreValue = useIgnoreFillValue(entity);

  return (
    <>
      <DimensionMapper
        dims={dims}
        dimMapping={dimMapping}
        isCached={useValuesCached(entity)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping} isSlice={selection !== undefined}>
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedHeatmapVis
              dataset={entity}
              value={value}
              dimMapping={dimMapping}
              title={entity.name}
              toolbarContainer={toolbarContainer}
              config={config}
              ignoreValue={ignoreValue}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default HeatmapVisContainer;
