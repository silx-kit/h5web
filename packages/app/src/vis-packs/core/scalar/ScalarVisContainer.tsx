import { ScalarVis } from '@h5web/lib';
import {
  assertDataset,
  assertPrintableType,
  assertScalarShape,
} from '@h5web/shared';

import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import VisBoundary from '../VisBoundary';
import { getFormatter } from './utils';

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
