import { type ExportEntry } from '@h5web/shared/vis-models';
import { FiDownload } from 'react-icons/fi';

import ActionMenu from './ActionMenu';
import { download } from './utils';

interface Props {
  entries: ExportEntry[];
  isSlice?: boolean;
}

function ExportMenu(props: Props) {
  const { entries, isSlice } = props;

  return (
    <ActionMenu
      label={`Export${isSlice ? ' slice' : ''}`}
      Icon={FiDownload}
      disabled={entries.length === 0}
      actions={entries.map(({ format, url }) => ({
        key: format,
        label: `Export to ${format.toUpperCase()}`,
        onSelect: () => {
          void download(url, `data.${format}`);
        },
      }))}
    />
  );
}

export default ExportMenu;
