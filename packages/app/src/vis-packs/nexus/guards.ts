import {
  assertNumericLikeOrComplexType,
  assertNumericType,
  isDefined,
} from '@h5web/shared/guards';
import { type NumericType } from '@h5web/shared/hdf5-models';

import { type NxData } from './models';

export function assertNumericLikeOrComplexNxData(
  nxData: NxData,
): asserts nxData is NxData {
  const { signalDef, auxDefs, axisDefs } = nxData;

  assertNumericLikeOrComplexType(signalDef.dataset);

  auxDefs.forEach((def) => {
    assertNumericLikeOrComplexType(def.dataset);
  });

  if (signalDef.errorDataset) {
    assertNumericType(signalDef.errorDataset);
  }

  axisDefs.filter(isDefined).forEach((def) => {
    assertNumericType(def.dataset);
  });
}

export function assertNumericNxData(
  nxData: NxData,
): asserts nxData is NxData<NumericType> {
  const { signalDef, auxDefs, axisDefs } = nxData;

  assertNumericType(signalDef.dataset);

  auxDefs.forEach((def) => {
    assertNumericType(def.dataset);
  });

  if (signalDef.errorDataset) {
    assertNumericType(signalDef.errorDataset);
  }

  axisDefs.filter(isDefined).forEach((def) => {
    assertNumericType(def.dataset);
  });
}
