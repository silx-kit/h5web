import ScalarVis from '../scalar/ScalarVis';
import { useDatasetValue } from '../hooks';
import {
  assertPrintableType,
  assertDataset,
  assertScalarShape,
  isComplexValue,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import { formatComplex } from '../../../utils';

function ScalarVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertScalarShape(entity);
  assertPrintableType(entity);

  const value = useDatasetValue(entity);

  if (isComplexValue(entity.type, value)) {
    return <ScalarVis value={value} formatter={formatComplex} />;
  }

  return <ScalarVis value={value} formatter={() => value.toString()} />;
}

export default ScalarVisContainer;
