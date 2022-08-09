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
import { getSliceSelection } from '../utils';
import MatrixToolbar from './MatrixToolbar';
import { useMatrixConfig } from './config';
import { getCellWidth, getFormatter } from './utils';

interface Props {
  dataset: Dataset<ArrayShape, PrintableType>;
  value: ArrayValue<PrintableType>;
  dimMapping: DimensionMapping;
  toolbarContainer: HTMLDivElement | undefined;
}

function MappedMatrixVis(props: Props) {
  const { dataset, value, dimMapping, toolbarContainer } = props;

  const { sticky, customCellWidth, notation } = useMatrixConfig(
    (state) => state,
    shallow
  );

  const { shape: dims, type } = dataset;
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  const formatter = getFormatter(type, notation);
  const cellWidth = getCellWidth(type);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <MatrixToolbar
            dataset={dataset}
            selection={getSliceSelection(dimMapping)}
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
