import { MatrixVis } from '@h5web/lib';
import type {
  ArrayShape,
  Dataset,
  PrintableType,
  Value,
} from '@h5web/shared/hdf5-models';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useDataContext } from '../../../providers/DataProvider';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import { getSliceSelection } from '../utils';
import type { MatrixVisConfig } from './config';
import MatrixToolbar from './MatrixToolbar';
import { getCellFormatter, getCellWidth } from './utils';

interface Props {
  dataset: Dataset<ArrayShape, PrintableType>;
  value: Value<Props['dataset']>;
  dimMapping: DimensionMapping;
  toolbarContainer: HTMLDivElement | undefined;
  config: MatrixVisConfig;
}

function MappedMatrixVis(props: Props) {
  const { dataset, value, dimMapping, toolbarContainer, config } = props;
  const { sticky, customCellWidth, notation } = config;

  const { shape: dims, type } = dataset;
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const mappedArray = useMappedArray(value, slicedDims, slicedMapping);

  const cellFormatter = getCellFormatter(mappedArray, type, notation);
  const cellWidth = getCellWidth(type);

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
        cellFormatter={cellFormatter}
        cellWidth={customCellWidth ?? cellWidth}
        sticky={sticky}
      />
    </>
  );
}

export default MappedMatrixVis;
