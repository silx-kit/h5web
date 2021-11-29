import { RgbVis } from '@h5web/lib';
import {
  assertGroupWithChildren,
  assertNumDims,
  DTypeClass,
} from '@h5web/shared';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import VisBoundary from '../../VisBoundary';
import RgbToolbar from '../../core/rgb/RgbToolbar';
import { useRgbVisConfig } from '../../core/rgb/config';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { useNxData } from '../hooks';
import { assertNumericSignal } from '../utils';

function NxRgbContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroupWithChildren(entity);

  const nxData = useNxData(entity);
  assertNumericSignal(nxData);

  const { signalDataset } = nxData;
  assertNumDims(signalDataset, 3);

  const { shape: dims } = signalDataset;

  const { showGrid, layout, imageType } = useRgbVisConfig(
    (state) => state,
    shallow
  );

  return (
    <VisBoundary loadingMessage="Loading image">
      <NxValuesFetcher
        nxData={nxData}
        render={(nxValues) => (
          <>
            {toolbarContainer && createPortal(<RgbToolbar />, toolbarContainer)}
            <RgbVis
              value={nxValues.signal}
              dims={dims}
              floatFormat={signalDataset.type.class === DTypeClass.Float}
              title={nxValues.title}
              showGrid={showGrid}
              layout={layout}
              imageType={imageType}
            />
          </>
        )}
      />
    </VisBoundary>
  );
}

export default NxRgbContainer;
