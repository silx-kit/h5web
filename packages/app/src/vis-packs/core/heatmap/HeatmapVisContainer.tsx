import {
  assertDataset,
  assertArrayShape,
  assertMinDims,
  assertNumericType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import { useFillValue } from '../hooks';
import { getSliceSelection } from '../utils';
import MappedHeatmapVis from './MappedHeatmapVis';
import { useHeatmapConfig } from './config';

function HeatmapVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertNumericType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const config = useHeatmapConfig();

  const fillValue = useFillValue(entity);

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
          selection={getSliceSelection(dimMapping)}
          render={(value) => (
            <MappedHeatmapVis
              dataset={entity}
              value={value}
              dimMapping={dimMapping}
              title={entity.name}
              toolbarContainer={toolbarContainer}
              config={config}
              fillValue={fillValue}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default HeatmapVisContainer;
