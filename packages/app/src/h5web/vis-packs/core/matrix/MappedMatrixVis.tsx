import { MatrixVis } from '@h5web/lib';
import type { Primitive, PrintableType } from '@h5web/shared';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import { useMatrixConfig } from './config';
import { useEffect } from 'react';

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

  const setCurrentSlice = useMatrixConfig((state) => state.setCurrentSlice);

  useEffect(() => {
    setCurrentSlice(mappedArray);
  }, [mappedArray, setCurrentSlice]);

  return (
    <MatrixVis
      dataArray={mappedArray}
      formatter={formatter}
      cellWidth={cellWidth}
    />
  );
}

export default MappedMatrixVis;
