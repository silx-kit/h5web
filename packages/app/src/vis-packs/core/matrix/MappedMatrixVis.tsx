import { MatrixVis } from '@h5web/lib';
import type {
  ArrayShape,
  ArrayValue,
  Dataset,
  PrintableType,
} from '@h5web/shared';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import MatrixToolbar from './MatrixToolbar';
import { useMatrixVisConfig } from './config';
import { getCellWidth, getFormatter } from './utils';

interface Props {
  dataset: Dataset<ArrayShape, PrintableType>;
  selection: string | undefined;
  value: ArrayValue<PrintableType>;
  dims: number[];
  dimMapping: DimensionMapping;
  toolbarContainer: HTMLDivElement | undefined;
}

function MappedMatrixVis(props: Props) {
  const { dataset, selection, value, dims, dimMapping, toolbarContainer } =
    props;

  const sticky = useMatrixVisConfig((state) => state.sticky);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  const formatter = getFormatter(dataset);
  const cellWidth = getCellWidth(dataset);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <MatrixToolbar dataset={dataset} selection={selection} />,
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
