import { supportsMatrixVis } from './vis/MatrixVis';
import { Vis } from './models';
import { HDF5Dataset } from '../providers/models';

type SupportFunction = (dataset: HDF5Dataset) => boolean;

const SUPPORT_CHECKS: Record<Vis, SupportFunction> = {
  [Vis.Raw]: () => true,
  [Vis.Matrix]: supportsMatrixVis,
};

export function getSupportedVis(dataset: HDF5Dataset): Vis[] {
  const supported = Object.entries(SUPPORT_CHECKS).reduce<Vis[]>(
    (arr, [vis, check]) => (check(dataset) ? [...arr, vis as Vis] : arr),
    []
  );

  // Remove Raw vis if any other vis is supported
  return supported.length > 1 ? supported.slice(1) : supported;
}
