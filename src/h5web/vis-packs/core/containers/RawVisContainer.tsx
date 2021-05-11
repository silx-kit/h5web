import RawVis from '../raw/RawVis';
import type { VisContainerProps } from '../../models';
import { assertDataset, assertNonNullShape } from '../../../guards';
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
