import { assertComplexType, assertNumericType } from '../../guards';
import type { ComplexType, NumericType } from '../../providers/models';
import type { NxData } from './models';

export function assertNumericNxData(
  nxData: NxData
): asserts nxData is NxData<NumericType> {
  const { signalDataset } = nxData;
  assertNumericType(signalDataset);
}

export function assertComplexNxData(
  nxData: NxData
): asserts nxData is NxData<ComplexType> {
  const { signalDataset } = nxData;
  assertComplexType(signalDataset);
}
