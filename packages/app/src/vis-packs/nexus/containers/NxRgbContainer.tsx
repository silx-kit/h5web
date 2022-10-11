import { assertGroup, assertNumDims } from '@h5web/shared';

import VisBoundary from '../../VisBoundary';
import MappedRgbVis from '../../core/rgb/MappedRgbVis';
import { useRgbConfig } from '../../core/rgb/config';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { useNxData } from '../hooks';
import { assertNumericSignal } from '../utils';

function NxRgbContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericSignal(nxData);

  const { signalDef } = nxData;
  assertNumDims(signalDef.dataset, 3);

  const { shape: dims } = signalDef.dataset;
  const config = useRgbConfig();

  return (
    <VisBoundary loadingMessage="Loading image">
      <NxValuesFetcher
        nxData={nxData}
        render={(nxValues) => (
          <MappedRgbVis
            value={nxValues.signal}
            dims={dims}
            toolbarContainer={toolbarContainer}
            title={nxValues.title}
            config={config}
          />
        )}
      />
    </VisBoundary>
  );
}

export default NxRgbContainer;
