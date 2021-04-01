import { useMemo } from 'react';
import MatrixVis from './MatrixVis';
import { useDatasetValue, useMappedArray } from '../hooks';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { Dataset, ArrayShape } from '../../../providers/models';
import { isAxis } from '../../../dimension-mapper/utils';
import type { PrintableType } from '../models';

interface Props {
  dataset: Dataset<ArrayShape, PrintableType>;
  dims: number[];
  dimMapping: DimensionMapping;
}

function MappedMatrixVis(props: Props) {
  const { dataset, dims, dimMapping } = props;

  const value = useDatasetValue(dataset, dimMapping);

  const [slicedDims, slicedMapping] = useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter((dim) => isAxis(dim)),
    ],
    [dimMapping, dims]
  );

  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  return <MatrixVis dataArray={mappedArray} />;
}

export default MappedMatrixVis;
