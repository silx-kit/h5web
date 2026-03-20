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
  const { fitImage, setFitImage } = config;

  return (
    <Toolbar>
      <ToggleBtn
        label="Fit image"
        Icon={MdOutlineFitScreen}
        value={fitImage}
        disabled={!isImage}
        onToggle={() => setFitImage(!fitImage)}
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
