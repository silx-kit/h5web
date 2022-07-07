import {
  Separator,
  ToggleBtn,
  Toolbar,
  ExportMenu,
  CellWidthInput,
} from '@h5web/lib';
import type { ArrayShape, Dataset } from '@h5web/shared';
import { hasNumericType } from '@h5web/shared';
import { FiAnchor } from 'react-icons/fi';

import { useDataContext } from '../../../providers/DataProvider';
import type { ExportFormat } from '../../../providers/models';
import { useMatrixConfig } from './config';

const EXPORT_FORMATS: ExportFormat[] = ['npy', 'csv'];

interface Props {
  dataset: Dataset<ArrayShape>;
  selection?: string | undefined;
  cellWidth: number;
}

function MatrixToolbar(props: Props) {
  const { dataset, selection, cellWidth } = props;
  const { getExportURL } = useDataContext();

  const { sticky, toggleSticky, customCellWidth, setCustomCellWidth } =
    useMatrixConfig();

  return (
    <Toolbar>
      <CellWidthInput
        value={customCellWidth}
        defaultValue={cellWidth}
        onChange={setCustomCellWidth}
      />

      <Separator />

      <ToggleBtn
        label="Freeze indices"
        icon={FiAnchor}
        value={sticky}
        onToggle={toggleSticky}
      />

      {getExportURL && hasNumericType(dataset) && (
        <>
          <Separator />
          <ExportMenu
            formats={EXPORT_FORMATS}
            isSlice={selection !== undefined}
            getFormatURL={(format: ExportFormat) =>
              getExportURL(dataset, selection, format)
            }
          />
        </>
      )}
    </Toolbar>
  );
}

export default MatrixToolbar;
