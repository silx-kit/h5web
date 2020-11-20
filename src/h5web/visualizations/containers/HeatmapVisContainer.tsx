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
import MappedHeatmapVis from '../heatmap/MappedHeatmapVis';
import { VisContainerProps } from './models';

function HeatmapVisContainer(props: VisContainerProps): ReactElement {
  const { entity, entityName } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertNumericType(entity);

  const { dims } = entity.shape;
  if (dims.length < 2) {
    throw new Error('Expected dataset with at least two dimensions');
  }

  const [mapperState, setMapperState] = useState<DimensionMapping>([
    ...range(dims.length - 2).fill(0),
    'y',
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
      <MappedHeatmapVis
        value={value}
        dims={dims}
        dimensionMapping={mapperState}
        title={entityName}
      />
    </>
  );
}

export default HeatmapVisContainer;
