import {
  assertDataset,
  assertArrayShape,
  assertPrintableType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import { getSliceSelection } from '../utils';
import MappedMatrixVis from './MappedMatrixVis';

function MatrixVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertPrintableType(entity);

  const { shape: dims } = entity;
  const axesCount = Math.min(dims.length, 2);
  const [dimMapping, setDimMapping] = useDimMappingState(dims, axesCount);
  const selection = getSliceSelection(dimMapping);

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
          selection={selection}
          render={(value) => (
            <MappedMatrixVis
              dataset={entity}
              selection={selection}
              value={value}
              dims={dims}
              dimMapping={dimMapping}
              toolbarContainer={toolbarContainer}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default MatrixVisContainer;
