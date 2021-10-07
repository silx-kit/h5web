import {
  assertDataset,
  assertArrayShape,
  assertPrintableType,
  hasComplexType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../hooks';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import VisBoundary from '../VisBoundary';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import { getFormatter } from '../matrix/utils';

function MatrixVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertPrintableType(entity);

  const { shape: dims } = entity;
  const axesCount = Math.min(dims.length, 2);
  const [dimMapping, setDimMapping] = useDimMappingState(dims, axesCount);

  const formatter = getFormatter(entity);
  const cellWidth = hasComplexType(entity) ? 232 : 116;

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
            <MappedMatrixVis
              value={value}
              dims={dims}
              dimMapping={dimMapping}
              formatter={formatter}
              cellWidth={cellWidth}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default MatrixVisContainer;
