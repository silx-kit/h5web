import {
  CellWidthInput,
  ExportMenu,
  NotationToggleGroup,
  Separator,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import { type ExportEntry } from '@h5web/shared/vis-models';
import { FiAnchor } from 'react-icons/fi';

import { type MatrixVisConfig } from './config';

interface Props {
  cellWidth: number;
  isSlice: boolean;
  config: MatrixVisConfig;
  exportEntries: ExportEntry[];
}

function MatrixToolbar(props: Props) {
  const { cellWidth, isSlice, config, exportEntries } = props;
  const {
    sticky,
    toggleSticky,
    customCellWidth,
    setCustomCellWidth,
    notation,
    setNotation,
  } = config;

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

      {exportEntries.length > 0 && (
        <>
          <Separator />
          <ExportMenu isSlice={isSlice} entries={exportEntries} />
        </>
      )}
    </Toolbar>
  );
}

export default MatrixToolbar;
