import MatrixVis from './MatrixVis';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { Primitive } from '../../../providers/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
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

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);

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
