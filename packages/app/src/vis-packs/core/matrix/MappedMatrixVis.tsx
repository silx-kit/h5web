import { MatrixVis } from '@h5web/lib';
import type { Primitive, PrintableType } from '@h5web/shared';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import MatrixToolbar from './MatrixToolbar';
import { useMatrixConfig } from './config';

interface Props {
  value: Primitive<PrintableType>[];
  dims: number[];
  dimMapping: DimensionMapping;
  formatter: (value: Primitive<PrintableType>) => string;
  cellWidth: number;
  toolbarContainer: HTMLDivElement | undefined;
}

function MappedMatrixVis(props: Props) {
  const { value, dims, dimMapping, formatter, cellWidth, toolbarContainer } =
    props;

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  const setCurrentSlice = useMatrixConfig((state) => state.setCurrentSlice);

  useEffect(() => {
    setCurrentSlice(mappedArray);
  }, [mappedArray, setCurrentSlice]);

  return (
    <>
      {toolbarContainer && createPortal(<MatrixToolbar />, toolbarContainer)}
      <MatrixVis
        dataArray={mappedArray}
        formatter={formatter}
        cellWidth={cellWidth}
      />
    </>
  );
}

export default MappedMatrixVis;
