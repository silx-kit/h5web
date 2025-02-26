import { RawImageVis, RawVis } from '@h5web/lib';
import {
  type ArrayShape,
  type Dataset,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useExportEntries } from '../hooks';
import { type RawConfig } from './config';
import RawToolbar from './RawToolbar';
import { isBinaryImage } from './utils';

interface Props {
  dataset: Dataset<ScalarShape | ArrayShape>;
  value: unknown;
  toolbarContainer?: HTMLDivElement | undefined;
  config: RawConfig;
}

function MappedRawVis(props: Props) {
  const { dataset, value, toolbarContainer, config } = props;

  const isImage = value instanceof Uint8Array && isBinaryImage(value);

  const exportEntries = useExportEntries(['json'], dataset, undefined, {
    json: () => JSON.stringify(value, null, 2),
  });

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <RawToolbar
            isImage={isImage}
            config={config}
            exportEntries={exportEntries}
          />,
          toolbarContainer,
        )}

      {isImage ? (
        <RawImageVis
          className={visualizerStyles.vis}
          value={value}
          title={dataset.name}
          fit={config.fitImage}
        />
      ) : (
        <RawVis className={visualizerStyles.vis} value={value} />
      )}
    </>
  );
}

export default MappedRawVis;
