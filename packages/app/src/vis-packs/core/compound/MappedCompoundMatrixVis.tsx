import { MatrixVis } from '@h5web/lib';
import type {
  ArrayShape,
  Dataset,
  Primitive,
  PrintableCompoundType,
  PrintableType,
} from '@h5web/shared';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import MatrixToolbar from '../matrix/MatrixToolbar';
import { useMatrixConfig } from '../matrix/config';
import { getCellWidth } from '../matrix/utils';
import { getSliceSelection } from '../utils';
import { compoundFormatter } from './utils';

interface Props {
  dataset: Dataset<ArrayShape, PrintableCompoundType>;
  value: Primitive<PrintableType>[][];
  dimMapping: DimensionMapping;
  toolbarContainer: HTMLDivElement | undefined;
}

function MappedCompoundMatrixVis(props: Props) {
  const { value, dataset, toolbarContainer, dimMapping } = props;

  const { sticky, customCellWidth } = useMatrixConfig(
    (state) => state,
    shallow
  );

  const { type, shape: dims } = dataset;
  const { fields } = type;
  const fieldNames = Object.keys(fields);
  const cellWidth = getCellWidth(type);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [mappedArray] = useMappedArray(
    value.flat(1),
    [...slicedDims, fieldNames.length],
    slicedMapping
  );

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
        formatter={compoundFormatter}
        cellWidth={customCellWidth ?? cellWidth}
        columnHeaders={fieldNames}
        sticky={sticky}
      />
    </>
  );
}

export default MappedCompoundMatrixVis;
