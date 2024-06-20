import { assertComplexType, assertNumericType } from '@h5web/shared/guards';
import type { ComplexType, NumericType } from '@h5web/shared/hdf5-models';

import type { NxData } from './models';

export function assertNumericNxData(
  nxData: NxData,
): asserts nxData is NxData<NumericType> {
  const { signalDef, auxDefs } = nxData;
  assertNumericType(signalDef.dataset);
  auxDefs.forEach((def) => assertNumericType(def.dataset));
}

export function assertComplexNxData(
  nxData: NxData,
): asserts nxData is NxData<ComplexType> {
  const { signalDef, auxDefs } = nxData;
  assertComplexType(signalDef.dataset);
  auxDefs.forEach((def) => assertComplexType(def.dataset));
}
