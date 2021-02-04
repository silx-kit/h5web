import type { ReactElement } from 'react';
import {
  assertDataset,
  assertNumericType,
  assertSimpleShape,
} from '../../../guards';
import MappedLineVis from '../line/MappedLineVis';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

function LineVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertNumericType(entity);

  const { name, shape } = entity;
  const { dims } = shape;
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
