import {
  assertDataset,
  assertNumericType,
  assertArrayShape,
} from '../../../guards';
import MappedLineVis from '../line/MappedLineVis';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

function LineVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumericType(entity);

  const { name, shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <MappedLineVis
        valueDataset={entity}
        dims={dims}
        dimMapping={dimMapping}
        title={name}
      />
    </>
  );
}

export default LineVisContainer;
