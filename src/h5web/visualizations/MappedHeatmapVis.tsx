import React, { ReactElement } from 'react';
import type { HDF5Dataset, HDF5Value } from '../providers/models';
import type { DimensionMapping } from '../dataset-visualizer/models';
import HeatmapVis from './heatmap/HeatmapVis';
import { assertArray } from './shared/utils';
import { useMappedArray } from './shared/hooks';

interface Props {
  value: HDF5Value;
  dataset: HDF5Dataset;
  mapperState: DimensionMapping;
}

function MappedHeatmapVis(props: Props): ReactElement {
  const { value, dataset, mapperState } = props;
  assertArray<number>(value);

  const dataArray = useMappedArray(dataset, value, mapperState);
  return <HeatmapVis dataArray={dataArray} />;
}

export default MappedHeatmapVis;
