import { MatrixVis } from '@h5web/lib';
import type {
  ArrayShape,
  ArrayValue,
  Dataset,
  PrintableType,
} from '@h5web/shared';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import MatrixToolbar from './MatrixToolbar';
import { useMatrixConfig } from './config';
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

  const { sticky, customCellWidth } = useMatrixConfig(
    (state) => state,
    shallow
  );

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  const formatter = getFormatter(dataset);
  const cellWidth = getCellWidth(dataset.type);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <MatrixToolbar
            dataset={dataset}
            selection={selection}
            cellWidth={cellWidth}
          />,
          toolbarContainer
        )}

      <MatrixVis
        dataArray={mappedArray}
        formatter={formatter}
        cellWidth={customCellWidth ?? cellWidth}
        sticky={sticky}
      />
    </>
  );
}

export default MappedMatrixVis;
