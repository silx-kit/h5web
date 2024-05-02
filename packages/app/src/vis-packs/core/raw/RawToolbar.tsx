import { ExportMenu, Separator, ToggleBtn, Toolbar } from '@h5web/lib';
import { MdOutlineFitScreen } from 'react-icons/md';

import type { ExportFormat, ExportURL } from '../../../providers/models';
import type { RawConfig } from './config';

interface Props {
  isImage: boolean;
  config: RawConfig;
  getExportURL: ((format: ExportFormat) => ExportURL) | undefined;
}

function RawToolbar(props: Props) {
  const { isImage, config, getExportURL } = props;
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

      {getExportURL && (
        <>
          <Separator />
          <ExportMenu
            entries={[{ format: 'json', url: getExportURL('json') }]}
            align="right"
          />
        </>
      )}
    </Toolbar>
  );
}

export default RawToolbar;
