import { RawImageVis, RawVis } from '@h5web/lib';
import { assertDataset, assertNonNullShape } from '@h5web/shared/guards';
import { createPortal } from 'react-dom';

import { useDataContext } from '../../../providers/DataProvider';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import { useRawConfig } from './config';
import RawToolbar from './RawToolbar';
import { isBinaryImage } from './utils';

function RawVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertNonNullShape(entity);

  const config = useRawConfig();
  const { getExportURL } = useDataContext();

  return (
    <VisBoundary>
      <ValueFetcher
        dataset={entity}
        render={(value) => {
          const isImage = value instanceof Uint8Array && isBinaryImage(value);

          return (
            <>
              {toolbarContainer &&
                createPortal(
                  <RawToolbar
                    isImage={isImage}
                    config={config}
                    getExportURL={
                      getExportURL &&
                      ((format) =>
                        getExportURL(format, entity, undefined, value))
                    }
                  />,
                  toolbarContainer,
                )}

              {isImage ? (
                <RawImageVis
                  className={visualizerStyles.vis}
                  value={value}
                  title={entity.name}
                  fit={config.fitImage}
                />
              ) : (
                <RawVis className={visualizerStyles.vis} value={value} />
              )}
            </>
          );
        }}
      />
    </VisBoundary>
  );
}

export default RawVisContainer;
