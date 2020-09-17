import React, { ReactElement } from 'react';
import MappedVis from './shared/MappedVis';
import type { HDF5Dataset, HDF5Value } from '../providers/models';
import type { DimensionMapping } from '../dataset-visualizer/models';
import HeatmapVis from './heatmap/HeatmapVis';
import { assertArray } from './shared/utils';

interface Props {
  value: HDF5Value;
  dataset: HDF5Dataset;
  mapperState: DimensionMapping;
}

function MappedHeatmapVis(props: Props): ReactElement {
  const { value, dataset, mapperState } = props;
  assertArray<number>(value);

  return (
    <MappedVis
      component={HeatmapVis}
      dataset={dataset}
      value={value}
      mapperState={mapperState}
    />
  );
}

export default MappedHeatmapVis;
