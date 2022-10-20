import {
  CellWidthInput,
  ExportMenu,
  NotationToggleGroup,
  Separator,
  ToggleBtn,
  Toolbar,
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

  const {
    sticky,
    toggleSticky,
    customCellWidth,
    setCustomCellWidth,
    notation,
    setNotation,
  } = useMatrixConfig();

  const exportEntries =
    getExportURL &&
    hasNumericType(dataset) &&
    EXPORT_FORMATS.map((format) => ({
      format,
      url: getExportURL(dataset, selection, format),
    }));

  return (
    <Toolbar>
      <CellWidthInput
        value={customCellWidth}
        defaultValue={cellWidth}
        onChange={setCustomCellWidth}
      />

      <Separator />

      <NotationToggleGroup value={notation} onChange={setNotation} />

      <ToggleBtn
        label="Freeze indices"
        icon={FiAnchor}
        value={sticky}
        onToggle={toggleSticky}
      />

      {exportEntries && (
        <>
          <Separator />
          <ExportMenu
            entries={exportEntries}
            isSlice={selection !== undefined}
          />
        </>
      )}
    </Toolbar>
  );
}

export default MatrixToolbar;
