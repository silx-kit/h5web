import { assertDataset, assertScalarShape } from '@h5web/shared/guards';

import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import { useScalarConfig } from './config';
import MappedScalarVis from './MappedScalarVis';

function ScalarVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertScalarShape(entity);

  const config = useScalarConfig();

  return (
    <VisBoundary>
      <ValueFetcher
        dataset={entity}
        render={(value) => (
          <MappedScalarVis
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

export default ScalarVisContainer;
