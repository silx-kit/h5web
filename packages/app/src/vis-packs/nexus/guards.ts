import {
  assertComplexType,
  assertNumericType,
  type ComplexType,
  type NumericType,
} from '@h5web/shared';

import { type NxData } from './models';

export function assertNumericNxData(
  nxData: NxData
): asserts nxData is NxData<NumericType> {
  const { signalDef } = nxData;
  assertNumericType(signalDef.dataset);
}

export function assertComplexNxData(
  nxData: NxData
): asserts nxData is NxData<ComplexType> {
  const { signalDef } = nxData;
  assertComplexType(signalDef.dataset);
}
