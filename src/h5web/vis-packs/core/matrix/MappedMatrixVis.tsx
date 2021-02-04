import type { ReactElement } from 'react';
import MatrixVis from './MatrixVis';
import { useBaseArray, useDatasetValue, useMappedArray } from '../hooks';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type {
  HDF5BaseType,
  HDF5SimpleShape,
} from '../../../providers/hdf5-models';
import type { Dataset } from '../../../providers/models';

interface Props {
  dataset: Dataset<HDF5SimpleShape, HDF5BaseType>;
  dims: number[];
  dimMapping: DimensionMapping;
}

function MappedMatrixVis(props: Props): ReactElement {
  const { dataset, dims, dimMapping } = props;

  const value = useDatasetValue(dataset);
  const baseArray = useBaseArray(value, dims);
  const mappedArray = useMappedArray(baseArray, dimMapping);

  return <MatrixVis dataArray={mappedArray} />;
}

export default MappedMatrixVis;
