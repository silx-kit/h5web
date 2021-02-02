import type { ReactElement } from 'react';
import type { HDF5Value } from '../../../providers/hdf5-models';
import MatrixVis from './MatrixVis';
import { assertArray } from '../../../guards';
import { useBaseArray, useMappedArray } from '../hooks';
import type { DimensionMapping } from '../../../dimension-mapper/models';

interface Props {
  value: HDF5Value;
  dims: number[];
  dimMapping: DimensionMapping;
}

function MappedMatrixVis(props: Props): ReactElement {
  const { value, dims, dimMapping } = props;
  assertArray<number | string>(value);

  const baseArray = useBaseArray(value, dims);
  const mappedArray = useMappedArray(baseArray, dimMapping);

  return <MatrixVis dataArray={mappedArray} />;
}

export default MappedMatrixVis;
