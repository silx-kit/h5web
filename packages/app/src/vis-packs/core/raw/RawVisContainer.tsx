import { assertDataset, assertNonNullShape } from '@h5web/shared/guards';

import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import { useRawConfig } from './config';
import MappedRawVis from './MappedRawVis';

function RawVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertNonNullShape(entity);

  const config = useRawConfig();

  return (
    <VisBoundary>
      <ValueFetcher
        dataset={entity}
        render={(value) => (
          <MappedRawVis
            dataset={entity}
            value={value}
            config={config}
            toolbarContainer={toolbarContainer}
          />
        )}
      />
    </VisBoundary>
  );
}

export default RawVisContainer;
