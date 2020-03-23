import { Vis } from './models';
import { HDF5Dataset } from '../providers/models';
import { isBaseType, isSimpleShape, hasSimpleDims } from '../providers/utils';

type SupportFunction = (dataset: HDF5Dataset) => boolean;

const SUPPORT_CHECKS: Record<Vis, SupportFunction> = {
  [Vis.Raw]: () => true,
  [Vis.Matrix]: dataset => {
    const { type, shape } = dataset;
    return isBaseType(type) && isSimpleShape(shape) && hasSimpleDims(shape);
  },
};

export function getSupportedVis(dataset: HDF5Dataset): Vis[] {
  const supported = Object.entries(SUPPORT_CHECKS).reduce<Vis[]>(
    (arr, [vis, check]) => (check(dataset) ? [...arr, vis as Vis] : arr),
    []
  );

  // Remove Raw vis if any other vis is supported
  return supported.length > 1 ? supported.slice(1) : supported;
}
