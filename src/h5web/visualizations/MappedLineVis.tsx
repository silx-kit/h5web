import React, { ReactElement } from 'react';
import type { HDF5Dataset, HDF5Value } from '../providers/models';
import type { DimensionMapping } from '../dataset-visualizer/models';
import LineVis from './line/LineVis';
import { assertArray } from './shared/utils';
import { useMappedArray, useDataDomain } from './shared/hooks';
import { useLineConfig } from './line/config';

interface Props {
  value: HDF5Value;
  dataset: HDF5Dataset;
  mapperState: DimensionMapping;
}

function MappedLineVis(props: Props): ReactElement {
  const { value, dataset, mapperState } = props;
  assertArray<number>(value);

  const { scaleType, curveType, showGrid } = useLineConfig();

  const dataArray = useMappedArray(dataset, value, mapperState);
  const dataDomain = useDataDomain(dataArray.data as number[]);

  return (
    <LineVis
      dataArray={dataArray}
      domain={dataDomain}
      scaleType={scaleType}
      curveType={curveType}
      showGrid={showGrid}
    />
  );
}

export default MappedLineVis;
