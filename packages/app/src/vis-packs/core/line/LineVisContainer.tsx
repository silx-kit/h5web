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
import { getSliceSelection } from '../utils';
import MappedLineVis from './MappedLineVis';
import { useLineConfig } from './config';

function LineVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumericType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

  const autoScale = useLineConfig((state) => state.autoScale);
  const selection = autoScale ? getSliceSelection(dimMapping) : undefined;

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary
        resetKey={dimMapping}
        loadingMessage={`Loading ${
          autoScale ? 'current slice' : 'entire dataset'
        }`}
      >
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedLineVis
              dataset={entity}
              selection={selection}
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

export default LineVisContainer;
