import {
  assertComplexType,
  assertNumericLikeOrComplexType,
  assertNumericLikeType,
  assertNumericType,
  isDefined,
} from '@h5web/shared/guards';
import {
  type ComplexType,
  type NumericLikeType,
  type NumericType,
} from '@h5web/shared/hdf5-models';

import { type NxData } from './models';

export function assertNumericLikeNxData(
  nxData: NxData,
): asserts nxData is NxData<NumericLikeType> {
  const { signalDef, auxDefs, axisDefs } = nxData;

  assertNumericLikeType(signalDef.dataset);

  auxDefs.forEach((def) => {
    assertNumericLikeType(def.dataset);
  });

  if (signalDef.errorDataset) {
    assertNumericType(signalDef.errorDataset);
  }

  axisDefs.filter(isDefined).forEach((def) => {
    assertNumericType(def.dataset);
  });
}

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

export function assertComplexNxData(
  nxData: NxData,
): asserts nxData is NxData<ComplexType> {
  const { signalDef, auxDefs, axisDefs } = nxData;

  assertComplexType(signalDef.dataset);

  auxDefs.forEach((def) => {
    assertComplexType(def.dataset);
  });

  if (signalDef.errorDataset) {
    assertNumericType(signalDef.errorDataset);
  }

  axisDefs.filter(isDefined).forEach((def) => {
    assertNumericType(def.dataset);
  });
}
