import {
  assertDataset,
  assertArrayShape,
  assertNumericType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import MappedLineVis from './MappedLineVis';

function LineVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
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
      <VisBoundary resetKey={dimMapping} loadingMessage="Loading current slice">
        <ValueFetcher
          dataset={entity}
          dimMapping={dimMapping}
          render={(value) => (
            <MappedLineVis
              value={value}
              dims={dims}
              dimMapping={dimMapping}
              title={entity.name}
              dtype={entity.type}
              toolbarContainer={toolbarContainer}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default LineVisContainer;
