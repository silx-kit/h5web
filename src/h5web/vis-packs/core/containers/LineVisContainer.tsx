import {
  assertDataset,
  assertNumericType,
  assertArrayShape,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import VisBoundary from '../VisBoundary';
import MappedLineVis from '../line/MappedLineVis';
import ValueFetcher from '../ValueFetcher';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

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
      <VisBoundary
        resetKey={dimMapping}
        loadingMessage="Loading entire dataset"
      >
        <ValueFetcher
          dataset={entity}
          render={(value) => (
            <MappedLineVis
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

export default LineVisContainer;
