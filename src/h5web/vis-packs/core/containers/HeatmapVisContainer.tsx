import { Suspense } from 'react';
import {
  assertDataset,
  assertMinDims,
  assertNumericType,
  assertArrayShape,
} from '../../../guards';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import ValueLoader from '../../../visualizer/ValueLoader';

function HeatmapVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertNumericType(entity);

  const { name, shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <Suspense fallback={<ValueLoader />}>
        <MappedHeatmapVis
          dataset={entity}
          dims={dims}
          dimMapping={dimMapping}
          title={name}
        />
      </Suspense>
    </>
  );
}

export default HeatmapVisContainer;
