import { Suspense } from 'react';
import {
  assertDataset,
  assertMinDims,
  assertArrayShape,
  assertComplexType,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import ValueLoader from '../../../visualizer/ValueLoader';
import MappedPhaseMapVis from '../complex/MappedPhaseMapVis';

function PhaseMapVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertComplexType(entity);

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
        <MappedPhaseMapVis
          dataset={entity}
          dims={dims}
          dimMapping={dimMapping}
          title={name}
        />
      </Suspense>
    </>
  );
}

export default PhaseMapVisContainer;
