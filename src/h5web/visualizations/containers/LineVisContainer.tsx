import React, { ReactElement, useState } from 'react';
import { range } from 'lodash-es';
import { useDatasetValue } from './hooks';
import {
  assertDataset,
  assertNumericType,
  assertSimpleShape,
} from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import MappedLineVis from '../line/MappedLineVis';
import { VisContainerProps } from './models';

function LineVisContainer(props: VisContainerProps): ReactElement {
  const { entity, entityName } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertNumericType(entity);

  const { dims } = entity.shape;
  if (dims.length === 0) {
    throw new Error('Expected dataset with at least one dimension');
  }

  const [mapperState, setMapperState] = useState<DimensionMapping>([
    ...range(dims.length - 1).fill(0),
    'x',
  ]);

  const value = useDatasetValue(entity.id);
  if (!value) {
    return <></>;
  }

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={mapperState}
        onChange={setMapperState}
      />
      <MappedLineVis
        value={value}
        dims={dims}
        dimensionMapping={mapperState}
        title={entityName}
      />
    </>
  );
}

export default LineVisContainer;
