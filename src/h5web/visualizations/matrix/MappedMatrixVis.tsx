import React, { ReactElement } from 'react';
import type { DimensionMapping } from '../../dataset-visualizer/models';
import MatrixVis from './MatrixVis';
import { assertArray } from '../shared/utils';
import { useMappedArray, useBaseArray } from '../shared/hooks';
import type { HDF5Value } from '../../providers/models';

interface Props {
  value: HDF5Value;
  rawDims: number[];
  mapperState: DimensionMapping;
}

function MappedMatrixVis(props: Props): ReactElement {
  const { value, rawDims, mapperState } = props;
  assertArray<number | string>(value);

  const baseArray = useBaseArray(value, rawDims);
  const dataArray = useMappedArray(baseArray, mapperState);
  return <MatrixVis dataArray={dataArray} />;
}

export default MappedMatrixVis;
