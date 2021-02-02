import type { ReactElement } from 'react';
import MatrixVis from './MatrixVis';
import { useBaseArray, useMappedArray } from '../hooks';
import type { DimensionMapping } from '../../../dimension-mapper/models';

interface Props {
  value: (string | number)[];
  dims: number[];
  dimMapping: DimensionMapping;
}

function MappedMatrixVis(props: Props): ReactElement {
  const { value, dims, dimMapping } = props;

  const baseArray = useBaseArray(value, dims);
  const mappedArray = useMappedArray(baseArray, dimMapping);

  return <MatrixVis dataArray={mappedArray} />;
}

export default MappedMatrixVis;
