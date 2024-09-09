import { MatrixVis } from '@h5web/lib';
import type {
  ArrayShape,
  Dataset,
  PrintableCompoundType,
  ScalarShape,
  Value,
} from '@h5web/shared/hdf5-models';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useDataContext } from '../../../providers/DataProvider';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import type { MatrixVisConfig } from '../matrix/config';
import MatrixToolbar from '../matrix/MatrixToolbar';
import { getCellWidth, getFormatter } from '../matrix/utils';
import { getSliceSelection } from '../utils';

interface Props {
  dataset: Dataset<ScalarShape | ArrayShape, PrintableCompoundType>;
  value: Value<Props['dataset']>;
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

  const fieldFormatters = Object.values(fields).map((field) =>
    getFormatter(field, notation),
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
