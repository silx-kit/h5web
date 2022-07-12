import { MatrixVis } from '@h5web/lib';
import type {
  ArrayShape,
  Dataset,
  Primitive,
  PrintableCompoundType,
  PrintableType,
} from '@h5web/shared';
import ndarray from 'ndarray';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import MatrixToolbar from '../matrix/MatrixToolbar';
import { useMatrixConfig } from '../matrix/config';
import { getCellWidth } from '../matrix/utils';
import { compoundFormatter } from './utils';

interface Props {
  dataset: Dataset<ArrayShape, PrintableCompoundType>;
  value: Primitive<PrintableType>[][];
  toolbarContainer: HTMLDivElement | undefined;
}

function MappedCompoundMatrixVis(props: Props) {
  const { value, dataset, toolbarContainer } = props;
  const { fields } = dataset.type;

  const fieldNames = Object.keys(fields);
  const cellWidth = getCellWidth(dataset.type);

  const dataArray = ndarray(value.flat(1), [
    ...dataset.shape,
    fieldNames.length,
  ]);

  const { sticky, customCellWidth } = useMatrixConfig(
    (state) => state,
    shallow
  );

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <MatrixToolbar dataset={dataset} cellWidth={cellWidth} />,
          toolbarContainer
        )}
      <MatrixVis
        dataArray={dataArray}
        formatter={compoundFormatter}
        cellWidth={customCellWidth ?? cellWidth}
        columnHeaders={fieldNames}
        sticky={sticky}
      />
    </>
  );
}

export default MappedCompoundMatrixVis;
