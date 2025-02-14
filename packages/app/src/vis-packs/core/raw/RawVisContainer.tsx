import { RawImageVis, RawVis } from '@h5web/lib';
import { assertDataset, assertNonNullShape } from '@h5web/shared/guards';
import { createPortal } from 'react-dom';

import { useDataContext } from '../../../providers/DataProvider';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type VisContainerProps } from '../../models';
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
          // 判断是否多张图片
          const isImageArray =
            Array.isArray(value) &&
            value.length > 0 &&
            value[0] instanceof Uint8Array &&
            isBinaryImage(value[0]);

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

              {isImage || isImageArray ? (
                <RawImageVis
                  className={visualizerStyles.vis}
                  type={isImageArray ? 'array' : 'single'}
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
