import {
  assertDataset,
  assertArrayShape,
  assertCompoundType,
  assertPrintableCompoundType,
} from '@h5web/shared';

import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import MappedCompoundMatrixVis from './MappedCompoundMatrixVis';

function CompoundMatrixVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertCompoundType(entity);
  assertPrintableCompoundType(entity);

  return (
    <VisBoundary loadingMessage="Loading current data">
      <ValueFetcher
        dataset={entity}
        render={(value) => (
          <MappedCompoundMatrixVis
            dataset={entity}
            value={value}
            toolbarContainer={toolbarContainer}
          />
        )}
      />
    </VisBoundary>
  );
}

export default CompoundMatrixVisContainer;
