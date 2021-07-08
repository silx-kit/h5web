import {
  assertGroupWithChildren,
  assertNumDims,
  assertNumericType,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../core/VisBoundary';
import NxValuesFetcher from '../NxValuesFetcher';
import { getNxData, getDatasetLabel } from '../utils';
import RgbVis from '../../core/rgb/RgbVis';
import { DTypeClass } from '../../../providers/models';
import { useRgbVisConfig } from '../../core/rgb/config';
import shallow from 'zustand/shallow';

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
