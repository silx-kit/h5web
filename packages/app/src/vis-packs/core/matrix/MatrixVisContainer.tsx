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
import { useMatrixConfig } from './config';

function MatrixVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertPrintableType(entity);

  const { shape: dims } = entity;
  const axesCount = Math.min(dims.length, 2);
  const [dimMapping, setDimMapping] = useDimMappingState(dims, axesCount);

  const config = useMatrixConfig();

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
          selection={getSliceSelection(dimMapping)}
          render={(value) => (
            <MappedMatrixVis
              dataset={entity}
              value={value}
              dimMapping={dimMapping}
              toolbarContainer={toolbarContainer}
              config={config}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default MatrixVisContainer;
