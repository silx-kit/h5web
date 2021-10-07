import {
  assertDataset,
  assertArrayShape,
  assertMinDims,
  assertNumericType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../hooks';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import VisBoundary from '../VisBoundary';
import MappedHeatmapVis from './MappedHeatmapVis';

function HeatmapVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertNumericType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping} loadingMessage="Loading current slice">
        <ValueFetcher
          dataset={entity}
          dimMapping={dimMapping}
          render={(value) => (
            <MappedHeatmapVis
              value={value}
              dims={dims}
              dimMapping={dimMapping}
              title={entity.name}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default HeatmapVisContainer;
