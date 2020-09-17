import React, { ReactElement } from 'react';
import type { HDF5Dataset, HDF5Value } from '../providers/models';
import type { DimensionMapping } from '../dataset-visualizer/models';
import LineVis from './line/LineVis';
import { assertArray } from './shared/utils';
import { useMappedArray } from './shared/hooks';

interface Props {
  value: HDF5Value;
  dataset: HDF5Dataset;
  mapperState: DimensionMapping;
}

function MappedLineVis(props: Props): ReactElement {
  const { value, dataset, mapperState } = props;
  assertArray<number>(value);

  const dataArray = useMappedArray(dataset, value, mapperState);
  return <LineVis dataArray={dataArray} />;
}

export default MappedLineVis;
