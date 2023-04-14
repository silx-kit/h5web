import { MatrixVis } from '@h5web/lib';
import {
  type ArrayShape,
  type Dataset,
  type Primitive,
  type PrintableCompoundType,
  type PrintableType,
} from '@h5web/shared';
import { createPortal } from 'react-dom';

import { type DimensionMapping } from '../../../dimension-mapper/models';
import { useDataContext } from '../../../providers/DataProvider';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import { type MatrixVisConfig } from '../matrix/config';
import MatrixToolbar from '../matrix/MatrixToolbar';
import { getCellWidth, getFormatter } from '../matrix/utils';
import { getSliceSelection } from '../utils';

interface Props {
  dataset: Dataset<ArrayShape, PrintableCompoundType>;
  value: Primitive<PrintableType>[][];
  dimMapping: DimensionMapping;
  toolbarContainer: HTMLDivElement | undefined;
  config: MatrixVisConfig;
}

function MappedCompoundMatrixVis(props: Props) {
  const { value, dataset, toolbarContainer, dimMapping, config } = props;
  const { sticky, customCellWidth, notation } = config;

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

  const fieldFormatters = Object.values(fields).map((field) =>
    getFormatter(field, notation)
  );

  const { getExportURL } = useDataContext();
  const selection = getSliceSelection(dimMapping);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <MatrixToolbar
            cellWidth={cellWidth}
            isSlice={selection !== undefined}
            config={config}
            getExportURL={
              getExportURL &&
              ((format) => getExportURL(format, dataset, selection, value))
            }
          />,
          toolbarContainer
        )}
      <MatrixVis
        dataArray={mappedArray}
        formatter={(val, colIndex) => fieldFormatters[colIndex](val)}
        cellWidth={customCellWidth ?? cellWidth}
        columnHeaders={fieldNames}
        sticky={sticky}
      />
    </>
  );
}

export default MappedCompoundMatrixVis;
