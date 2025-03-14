import { ExportMenu, Separator, ToggleBtn, Toolbar } from '@h5web/lib';
import { type ExportEntry } from '@h5web/shared/vis-models';
import { MdOutlineFitScreen } from 'react-icons/md';

import { type ScalarConfig } from './config';

interface Props {
  isImage: boolean;
  config: ScalarConfig;
  exportEntries: ExportEntry[];
}

function ScalarToolbar(props: Props) {
  const { isImage, config, exportEntries } = props;
  const { fitImage, toggleFitImage } = config;

  return (
    <Toolbar>
      <ToggleBtn
        label="Fit image"
        icon={MdOutlineFitScreen}
        value={fitImage}
        disabled={!isImage}
        onToggle={toggleFitImage}
      />

      {exportEntries.length > 0 && (
        <>
          <Separator />
          <ExportMenu entries={exportEntries} />
        </>
      )}
    </Toolbar>
  );
}

export default ScalarToolbar;
