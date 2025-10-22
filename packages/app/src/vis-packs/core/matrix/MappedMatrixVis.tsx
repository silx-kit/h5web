import {
  type DimensionMapping,
  getSliceSelection,
  MatrixVis,
  useSlicedDimsAndMapping,
} from '@h5web/lib';
import {
  type ArrayShape,
  type ArrayValue,
  type Dataset,
  type PrintableType,
} from '@h5web/shared/hdf5-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useExportEntries, useMappedArray } from '../hooks';
import { type MatrixVisConfig } from './config';
import MatrixToolbar from './MatrixToolbar';
import {
  generateCsv,
  getCellWidth,
  getCsvFormatter,
  getFormatter,
} from './utils';

interface Props {
  dataset: Dataset<ArrayShape, PrintableType>;
  value: ArrayValue<PrintableType>;
  dimMapping: DimensionMapping;
  toolbarContainer: HTMLDivElement | undefined;
  config: MatrixVisConfig;
}

function MappedMatrixVis(props: Props) {
  const { dataset, value, dimMapping, toolbarContainer, config } = props;
  const { customCellWidth, notation } = config;

  const { shape: dims, type } = dataset;
  const mappingArgs = useSlicedDimsAndMapping(dims, dimMapping);
  const mappedArray = useMappedArray(value, ...mappingArgs);

  const formatter = getFormatter(type, notation);
  const cellWidth = getCellWidth(type);
  const selection = getSliceSelection(dimMapping);

  const exportEntries = useExportEntries(['npy', 'csv'], dataset, selection, {
    csv: () => generateCsv(mappedArray, getCsvFormatter(type)),
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
        cellFormatter={(row: number, col: number) =>
          formatter(mappedArray.get(row, col))
        }
        cellWidth={customCellWidth ?? cellWidth}
      />
    </>
  );
}

export default MappedMatrixVis;
