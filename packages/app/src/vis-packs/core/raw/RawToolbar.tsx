import { ExportMenu, Toolbar } from '@h5web/lib';

import type { ExportFormat, ExportURL } from '../../../providers/models';

interface Props {
  getExportURL: ((format: ExportFormat) => ExportURL) | undefined;
}

function RawToolbar(props: Props) {
  const { getExportURL } = props;

  return (
    <Toolbar>
      {getExportURL && (
        <ExportMenu
          entries={[{ format: 'json', url: getExportURL('json') }]}
          align="right"
        />
      )}
    </Toolbar>
  );
}

export default RawToolbar;
