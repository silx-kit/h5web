import { MatrixVis } from '@h5web/lib';
import type { Primitive, PrintableType } from '@h5web/shared';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import MatrixToolbar from './MatrixToolbar';
import { useMatrixVisConfig } from './config';

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

  const sticky = useMatrixVisConfig((state) => state.sticky);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <MatrixToolbar currentSlice={mappedArray} />,
          toolbarContainer
        )}

      <MatrixVis
        dataArray={mappedArray}
        formatter={formatter}
        cellWidth={cellWidth}
        sticky={sticky}
      />
    </>
  );
}

export default MappedMatrixVis;
