import {
  assertDataset,
  assertArrayShape,
  assertNumericType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import LimitedValueFetcher from '../LimitedValueFetcher';
import MappedLineVis from './MappedLineVis';

function LineVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumericType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping} loadingMessage="Loading dataset">
        <LimitedValueFetcher
          dataset={entity}
          dimMapping={dimMapping}
          render={(value, isSlice) => (
            <MappedLineVis
              value={value}
              dims={dims}
              dimMapping={dimMapping}
              title={entity.name}
              isValueSlice={isSlice}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default LineVisContainer;
