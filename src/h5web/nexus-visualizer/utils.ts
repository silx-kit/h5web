import type { HDF5Dataset, HDF5Group, HDF5Value } from '../providers/models';
import type { Vis } from '../dataset-visualizer/models';
import {
  NXDataAttribute,
  NXDataInterpretation,
  INTERPRETATION_VIS,
} from './models';

export function getAttributeValue(
  entity: HDF5Dataset | HDF5Group,
  attributeName: NXDataAttribute
): HDF5Value {
  if (!entity.attributes) {
    return undefined;
  }

  return entity.attributes.find((attr) => attr.name === attributeName)?.value;
}

export function getInterpretationVis(group: HDF5Group): Vis | undefined {
  const signalInterpretation = getAttributeValue(
    group,
    NXDataAttribute.Interpretation
  );

  return (
    signalInterpretation &&
    INTERPRETATION_VIS[signalInterpretation as NXDataInterpretation]
  );
}
