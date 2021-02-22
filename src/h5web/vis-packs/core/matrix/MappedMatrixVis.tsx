import { ReactElement, useMemo } from 'react';
import MatrixVis from './MatrixVis';
import { useBaseArray, useDatasetValue, useMappedArray } from '../hooks';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { HDF5SimpleShape } from '../../../providers/hdf5-models';
import type { Dataset } from '../../../providers/models';
import { isAxis } from '../../../dimension-mapper/utils';
import type { PrintableType } from '../models';

interface Props {
  dataset: Dataset<HDF5SimpleShape, PrintableType>;
  dims: number[];
  dimMapping: DimensionMapping;
}

function MappedMatrixVis(props: Props): ReactElement {
  const { dataset, dims, dimMapping } = props;

  const value = useDatasetValue(dataset, dimMapping);

  const [slicedDims, slicedMapping] = useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter((dim) => isAxis(dim)),
    ],
    [dimMapping, dims]
  );

  const baseArray = useBaseArray(value, slicedDims);
  const mappedArray = useMappedArray(baseArray, slicedMapping);

  return <MatrixVis dataArray={mappedArray} />;
}

export default MappedMatrixVis;
