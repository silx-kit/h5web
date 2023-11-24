import { RawVis } from '@h5web/lib';
import { assertDataset, assertNonNullShape } from '@h5web/shared/guards';
import { createPortal } from 'react-dom';

import { useDataContext } from '../../../providers/DataProvider';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import RawToolbar from './RawToolbar';

function RawVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertNonNullShape(entity);

  const { getExportURL } = useDataContext();

  return (
    <VisBoundary>
      <ValueFetcher
        dataset={entity}
        render={(value) => (
          <>
            {toolbarContainer &&
              createPortal(
                <RawToolbar
                  getExportURL={
                    getExportURL &&
                    ((format) => getExportURL(format, entity, undefined, value))
                  }
                />,
                toolbarContainer,
              )}
            <RawVis value={value} />
          </>
        )}
      />
    </VisBoundary>
  );
}

export default RawVisContainer;
