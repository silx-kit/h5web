import type { ReactElement } from 'react';
import ScalarVis from '../scalar/ScalarVis';
import { useDatasetValue } from '../hooks';
import {
  assertBaseType,
  assertDataset,
  assertScalarShape,
} from '../../../guards';
import type { VisContainerProps } from '../../models';

function ScalarVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertScalarShape(entity);
  assertBaseType(entity);

  const value = useDatasetValue(entity);
  return <ScalarVis value={value} />;
}

export default ScalarVisContainer;
