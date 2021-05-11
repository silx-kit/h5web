import {
  assertPrintableType,
  assertDataset,
  assertArrayShape,
  hasComplexType,
} from '../../../guards';
import MappedMatrixVis from '../matrix/MappedMatrixVis';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import VisBoundary from '../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import { getFormatter } from '../matrix/utils';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

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
