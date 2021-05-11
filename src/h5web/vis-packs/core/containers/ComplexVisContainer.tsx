import {
  assertDataset,
  assertMinDims,
  assertArrayShape,
  assertComplexType,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import MappedComplexVis from '../complex/MappedComplexVis';
import VisBoundary from '../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

function ComplexVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 2);
  assertComplexType(entity);

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
            <MappedComplexVis
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

export default ComplexVisContainer;
