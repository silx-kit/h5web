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
import { usePacking, useUnpackedArray } from '../../netcdf/hooks';
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

  const packing = usePacking(dataset);
  const unpackedValue = useUnpackedArray(value, packing);
  const type = packing?.type ?? dataset.type;

  const mappingArgs = useSlicedDimsAndMapping(dataset.shape.dims, dimMapping);
  const mappedArray = useMappedArray(unpackedValue, ...mappingArgs);

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
