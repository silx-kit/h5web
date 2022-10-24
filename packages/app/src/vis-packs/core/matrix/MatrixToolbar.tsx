import {
  CellWidthInput,
  ExportMenu,
  NotationToggleGroup,
  Separator,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import { FiAnchor } from 'react-icons/fi';

import type { ExportFormat } from '../../../providers/models';
import { useMatrixConfig } from './config';

const EXPORT_FORMATS: ExportFormat[] = ['npy', 'csv'];

interface Props {
  cellWidth: number;
  isSlice: boolean;
  getExportURL: ((format: ExportFormat) => URL | undefined) | undefined;
}

function MatrixToolbar(props: Props) {
  const { cellWidth, isSlice, getExportURL } = props;

  const {
    sticky,
    toggleSticky,
    customCellWidth,
    setCustomCellWidth,
    notation,
    setNotation,
  } = useMatrixConfig();

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

      {getExportURL && (
        <>
          <Separator />
          <ExportMenu
            isSlice={isSlice}
            entries={EXPORT_FORMATS.map((format) => ({
              format,
              url: getExportURL(format),
            }))}
          />
        </>
      )}
    </Toolbar>
  );
}

export default MatrixToolbar;
