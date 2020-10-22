import React, { ReactElement } from 'react';
import type { HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dimension-mapper/models';
import MatrixVis from './MatrixVis';
import { assertArray } from '../shared/utils';
import { useMappedArray, useBaseArray } from '../shared/hooks';

interface Props {
  value: HDF5Value;
  dims: number[];
  mapperState: DimensionMapping;
}

function MappedMatrixVis(props: Props): ReactElement {
  const { value, dims, mapperState } = props;
  assertArray<number | string>(value);

  const baseArray = useBaseArray(value, dims);
  const dataArray = useMappedArray(baseArray, mapperState);
  return <MatrixVis dataArray={dataArray} />;
}

export default MappedMatrixVis;
