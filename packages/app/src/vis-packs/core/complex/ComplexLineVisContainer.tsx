import {
  assertDataset,
  assertArrayShape,
  assertComplexType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import VisBoundary from '../../VisBoundary';
import { useDimMappingState } from '../../hooks';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import MappedComplexLineVis from './MappedComplexLineVis';

function ComplexLineVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertComplexType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary
        resetKey={dimMapping}
        loadingMessage="Loading entire dataset"
      >
        <ValueFetcher
          dataset={entity}
          render={(value) => (
            <MappedComplexLineVis
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

export default ComplexLineVisContainer;
