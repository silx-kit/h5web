import { BinaryImageVis, ScalarVis } from '@h5web/lib';
import {
  type ArrayShape,
  type Dataset,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useExportEntries } from '../hooks';
import { type ScalarConfig } from './config';
import ScalarToolbar from './ScalarToolbar';
import { getFormatter, isBinaryImage } from './utils';

interface Props {
  dataset: Dataset<ScalarShape | ArrayShape>;
  value: unknown;
  toolbarContainer?: HTMLDivElement | undefined;
  config: ScalarConfig;
}

function MappedScalarVis(props: Props) {
  const { dataset, value, toolbarContainer, config } = props;

  const exportEntries = useExportEntries(['json'], dataset, undefined, {
    json: () => JSON.stringify(value, null, 2),
  });

  const isImage = value instanceof Uint8Array && isBinaryImage(value);
  const formatter = getFormatter(dataset.type);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <ScalarToolbar
            isImage={isImage}
            config={config}
            exportEntries={exportEntries}
          />,
          toolbarContainer,
        )}

      {isImage ? (
        <BinaryImageVis
          className={visualizerStyles.vis}
          value={value}
          title={dataset.name}
          fit={config.fitImage}
        />
      ) : (
        <ScalarVis className={visualizerStyles.vis} value={formatter(value)} />
      )}
    </>
  );
}

export default MappedScalarVis;
