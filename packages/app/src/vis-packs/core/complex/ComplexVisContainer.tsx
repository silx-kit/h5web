import {
  assertDataset,
  assertArrayShape,
  assertComplexType,
  assertMinDims,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import MappedComplexVis from './MappedComplexVis';

function ComplexVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
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
              toolbarContainer={toolbarContainer}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default ComplexVisContainer;
