import { Separator, ToggleBtn, Toolbar, ExportMenu } from '@h5web/lib';
import type { ArrayShape, Dataset, PrintableType } from '@h5web/shared';
import { hasNumericType } from '@h5web/shared';
import { useContext } from 'react';
import { FiAnchor } from 'react-icons/fi';

import { ProviderContext } from '../../../providers/context';
import type { ExportFormat } from '../../../providers/models';
import { useMatrixVisConfig } from './config';

const EXPORT_FORMATS: ExportFormat[] = ['npy', 'csv'];

interface Props {
  dataset: Dataset<ArrayShape, PrintableType>;
  selection: string | undefined;
}

function MatrixToolbar(props: Props) {
  const { dataset, selection } = props;
  const { getExportURL } = useContext(ProviderContext);

  const { sticky, toggleSticky } = useMatrixVisConfig();

  return (
    <Toolbar>
      <ToggleBtn
        label="Freeze indices"
        icon={FiAnchor}
        value={sticky}
        onToggle={toggleSticky}
      />

      {hasNumericType(dataset) && (
        <>
          <Separator />
          <ExportMenu
            formats={EXPORT_FORMATS}
            isSlice={selection !== undefined}
            getFormatURL={(format: ExportFormat) =>
              getExportURL?.(dataset, selection, format)
            }
          />
        </>
      )}
    </Toolbar>
  );
}

export default MatrixToolbar;
