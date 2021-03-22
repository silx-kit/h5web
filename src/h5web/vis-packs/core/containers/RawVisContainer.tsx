import RawVis from '../raw/RawVis';
import type { VisContainerProps } from '../../models';
import { useDatasetValue } from '../hooks';
import { assertDataset } from '../../../guards';

function RawVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity);
  return <RawVis value={value} />;
}

export default RawVisContainer;
