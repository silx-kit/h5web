import {
  assertArrayShape,
  assertDataset,
  assertNumDims,
  assertNumericType,
} from '@h5web/shared/guards';

import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import { useVolumeConfig } from './config';
import MappedVolumeVis from './MappedVolumeVis';

function VolumeVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumDims(entity, 3);
  assertNumericType(entity);

  const config = useVolumeConfig();

  return (
    <VisBoundary>
      <ValueFetcher
        dataset={entity}
        render={(value) => (
          <MappedVolumeVis
            dataset={entity}
            value={value}
            toolbarContainer={toolbarContainer}
            config={config}
          />
        )}
      />
    </VisBoundary>
  );
}

export default VolumeVisContainer;
