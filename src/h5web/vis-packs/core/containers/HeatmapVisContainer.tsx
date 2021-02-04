import { ReactElement, Suspense } from 'react';
import {
  assertDataset,
  assertMinDims,
  assertNumericType,
  assertSimpleShape,
} from '../../../guards';
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import ValueLoader from '../../../visualizer/ValueLoader';

function HeatmapVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertNumericType(entity);
  assertMinDims(entity, 2);

  const { name, shape } = entity;
  const { dims } = shape;
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
