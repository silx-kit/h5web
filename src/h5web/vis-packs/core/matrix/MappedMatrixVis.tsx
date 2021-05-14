import { useMemo } from 'react';
import MatrixVis from './MatrixVis';
import { useMappedArray } from '../hooks';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { Primitive } from '../../../providers/models';
import { isAxis } from '../../../dimension-mapper/utils';
import type { PrintableType } from '../models';

interface Props {
  value: Primitive<PrintableType>[];
  dims: number[];
  dimMapping: DimensionMapping;
  formatter: (value: Primitive<PrintableType>) => string;
  cellWidth: number;
}

function MappedMatrixVis(props: Props) {
  const { value, dims, dimMapping, formatter, cellWidth } = props;

  const [slicedDims, slicedMapping] = useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter((dim) => isAxis(dim)),
    ],
    [dimMapping, dims]
  );

  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  return (
    <MatrixVis
      dataArray={mappedArray}
      formatter={formatter}
      cellWidth={cellWidth}
    />
  );
}

export default MappedMatrixVis;
