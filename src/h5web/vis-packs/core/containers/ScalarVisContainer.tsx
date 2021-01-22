import type { ReactElement } from 'react';
import ScalarVis from '../scalar/ScalarVis';
import { useDatasetValue } from '../hooks';
import { assertDataset } from '../../../guards';
import type { VisContainerProps } from '../../models';

function ScalarVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity.path);
  return <ScalarVis value={value} />;
}

export default ScalarVisContainer;
