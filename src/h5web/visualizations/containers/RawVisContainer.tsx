import type { ReactElement } from 'react';
import RawVis from '../RawVis';
import type { VisContainerProps } from './models';
import { useDatasetValue } from './hooks';
import { assertDataset } from '../../guards';

function RawVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity.id);
  return <RawVis value={value} />;
}

export default RawVisContainer;
