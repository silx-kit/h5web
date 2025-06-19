import {
  type DimensionMapping,
  getSliceSelection,
  MatrixVis,
  useSlicedDimsAndMapping,
} from '@h5web/lib';
import {
  type ArrayShape,
  type ArrayValue,
  type CompoundType,
  type Dataset,
  type PrintableType,
  type ScalarShape,
  type ScalarValue,
} from '@h5web/shared/hdf5-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useExportEntries, useMappedArray } from '../hooks';
import { type MatrixVisConfig } from '../matrix/config';
import MatrixToolbar from '../matrix/MatrixToolbar';
import { getCellWidth, getCsvFormatter, getFormatter } from '../matrix/utils';
import { generateCsv } from './utils';

interface Props {
  dataset: Dataset<ScalarShape | ArrayShape, CompoundType<PrintableType>>;
  value:
    | ScalarValue<CompoundType<PrintableType>>
    | ArrayValue<CompoundType<PrintableType>>;
  dimMapping: DimensionMapping;
  toolbarContainer: HTMLDivElement | undefined;
  config: MatrixVisConfig;
}

function MappedCompoundVis(props: Props) {
  const { value, dataset, toolbarContainer, dimMapping, config } = props;
  const { sticky, customCellWidth, notation } = config;

  const { type, shape: dims } = dataset;
  const { fields } = type;
  const fieldNames = Object.keys(fields);
  const cellWidth = getCellWidth(type);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(
    dims.length === 0 ? [1] : dims,
    dimMapping,
  );

  const mappedArray = useMappedArray(
    value.flat(1),
    [...slicedDims, fieldNames.length],
    slicedMapping,
  );

  const selection = getSliceSelection(dimMapping);
  const fieldFormatters = Object.values(fields).map((field) =>
    getFormatter(field, notation),
  );

  const exportEntries = useExportEntries(['npy', 'csv'], dataset, selection, {
    csv: () =>
      generateCsv(
        fieldNames,
        mappedArray,
        Object.values(fields).map((field) => getCsvFormatter(field)),
      ),
  });

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <MatrixToolbar
            cellWidth={cellWidth}
            isSlice={selection !== undefined}
            config={config}
            exportEntries={exportEntries}
          />,
          toolbarContainer,
        )}
      <MatrixVis
        className={visualizerStyles.vis}
        dims={mappedArray.shape}
        cellFormatter={(row, col) =>
          fieldFormatters[col](mappedArray.get(row, col))
        }
        cellWidth={customCellWidth ?? cellWidth}
        columnHeaders={fieldNames}
        sticky={sticky}
      />
    </>
  );
}

export default MappedCompoundVis;
