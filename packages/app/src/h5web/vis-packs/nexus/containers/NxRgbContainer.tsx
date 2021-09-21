import shallow from 'zustand/shallow';
import {
  assertGroupWithChildren,
  assertNumericType,
  assertNumDims,
  DTypeClass,
} from '@h5web/shared';
import RgbVis from '@h5web/lib/src/h5web/vis-packs/core/rgb/RgbVis';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../core/VisBoundary';
import NxValuesFetcher from '../NxValuesFetcher';
import { getNxData, getDatasetLabel } from '../utils';
import { useRgbVisConfig } from '../../core/rgb/config';

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
        nxData={nxData}
        render={(nxValues) => {
          const { signal, title } = nxValues;
          return (
            <RgbVis
              value={signal as number[]}
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
