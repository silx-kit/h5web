import RawVis from '@h5web/lib/src/h5web/vis-packs/core/raw/RawVis';
import type { VisContainerProps } from '../../models';
import { assertDataset, assertNonNullShape } from '@h5web/shared';
import VisBoundary from '../VisBoundary';
import ValueFetcher from '../ValueFetcher';

function RawVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertNonNullShape(entity);

  return (
    <VisBoundary resetKey={entity}>
      <ValueFetcher
        dataset={entity}
        render={(value) => <RawVis value={value} />}
      />
    </VisBoundary>
  );
}

export default RawVisContainer;
