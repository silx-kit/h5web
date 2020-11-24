import React, { ReactElement } from 'react';
import type { HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dimension-mapper/models';
import MatrixVis from './MatrixVis';
import { assertArray } from '../shared/utils';
import { useDataArrays } from '../shared/hooks';

interface Props {
  value: HDF5Value;
  dims: number[];
  mapperState: DimensionMapping;
}

function MappedMatrixVis(props: Props): ReactElement {
  const { value, dims, mapperState } = props;
  assertArray<number | string>(value);

  const { mappedArray } = useDataArrays(value, dims, mapperState);
  return <MatrixVis dataArray={mappedArray} />;
}

export default MappedMatrixVis;
