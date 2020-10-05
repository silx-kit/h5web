import React, { ReactElement } from 'react';
import type { HDF5Dataset, HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dataset-visualizer/models';
import MatrixVis from './MatrixVis';
import { assertArray } from '../shared/utils';
import { useMappedArray, useBaseArray } from '../shared/hooks';

interface Props {
  value: HDF5Value;
  dataset: HDF5Dataset;
  mapperState: DimensionMapping;
}

function MappedMatrixVis(props: Props): ReactElement {
  const { value, dataset, mapperState } = props;
  assertArray<number | string>(value);

  const baseArray = useBaseArray(dataset, value);
  const dataArray = useMappedArray(baseArray, mapperState);
  return <MatrixVis dataArray={dataArray} />;
}

export default MappedMatrixVis;
