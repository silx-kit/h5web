import {
  Separator,
  ToggleBtn,
  Toolbar,
  ExportMenu,
  CellWidthInput,
} from '@h5web/lib';
import type { ArrayShape, Dataset, PrintableType } from '@h5web/shared';
import { hasNumericType } from '@h5web/shared';
import { useContext } from 'react';
import { FiAnchor } from 'react-icons/fi';

import { ProviderContext } from '../../../providers/context';
import type { ExportFormat } from '../../../providers/models';
import { useMatrixConfig } from './config';

const EXPORT_FORMATS: ExportFormat[] = ['npy', 'csv'];

interface Props {
  dataset: Dataset<ArrayShape, PrintableType>;
  selection: string | undefined;
  cellWidth: number;
}

function MatrixToolbar(props: Props) {
  const { dataset, selection, cellWidth } = props;
  const { getExportURL } = useContext(ProviderContext);

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
