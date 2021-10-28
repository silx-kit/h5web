import { RgbVis } from '@h5web/lib';
import type { NumericType } from '@h5web/shared';
import {
  assertGroupWithChildren,
  assertNumericType,
  assertNumDims,
  DTypeClass,
} from '@h5web/shared';
import shallow from 'zustand/shallow';

import VisBoundary from '../../VisBoundary';
import { useRgbVisConfig } from '../../core/rgb/config';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import type { NxData } from '../models';
import { getNxData, getDatasetLabel } from '../utils';

function NxRgbContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroupWithChildren(entity);

  const nxData = getNxData(entity);
  const { signalDataset } = nxData;
  assertNumericType(signalDataset);
  assertNumDims(signalDataset, 3);

  const { shape: dims } = signalDataset;

  const { showGrid, layout, imageType } = useRgbVisConfig(
    (state) => state,
    shallow
  );

  return (
    <VisBoundary loadingMessage="Loading image">
      <NxValuesFetcher
        nxData={nxData as NxData<NumericType>}
        render={(nxValues) => {
          const { signal, title } = nxValues;
          return (
            <RgbVis
              value={signal}
              dims={dims}
              floatFormat={signalDataset.type.class === DTypeClass.Float}
              title={title || getDatasetLabel(signalDataset)}
              showGrid={showGrid}
              layout={layout}
              imageType={imageType}
            />
          );
        }}
      />
    </VisBoundary>
  );
}

export default NxRgbContainer;
