import { RawVis } from '@h5web/lib';
import { assertDataset, assertNonNullShape } from '@h5web/shared';

import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import VisBoundary from '../VisBoundary';

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
