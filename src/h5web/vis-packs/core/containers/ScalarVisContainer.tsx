import ScalarVis from '../scalar/ScalarVis';
import {
  assertPrintableType,
  assertDataset,
  assertScalarShape,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import { getFormatter } from '../scalar/utils';
import ValueFetcher from '../ValueFetcher';
import VisBoundary from '../VisBoundary';

function ScalarVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertScalarShape(entity);
  assertPrintableType(entity);

  const formatter = getFormatter(entity);

  return (
    <VisBoundary resetKey={entity}>
      <ValueFetcher
        dataset={entity}
        render={(value) => <ScalarVis value={value} formatter={formatter} />}
      />
    </VisBoundary>
  );
}

export default ScalarVisContainer;
