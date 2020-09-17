import React, { ReactElement } from 'react';
import MappedVis from './shared/MappedVis';
import type { HDF5Dataset, HDF5Value } from '../providers/models';
import type { DimensionMapping } from '../dataset-visualizer/models';
import LineVis from './line/LineVis';
import { assertArray } from './shared/utils';

interface Props {
  value: HDF5Value;
  dataset: HDF5Dataset;
  mapperState: DimensionMapping;
}

function MappedLineVis(props: Props): ReactElement {
  const { value, dataset, mapperState } = props;
  assertArray<number>(value);

  return (
    <MappedVis
      component={LineVis}
      dataset={dataset}
      value={value}
      mapperState={mapperState}
    />
  );
}

export default MappedLineVis;
