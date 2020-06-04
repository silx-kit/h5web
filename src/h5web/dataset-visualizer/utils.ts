import type { Vis } from './models';
import type { HDF5Dataset } from '../providers/models';
import { VIS_DEFS } from '../visualizations';

export function getSupportedVis(dataset?: HDF5Dataset): Vis[] {
  if (!dataset) {
    return [];
  }
  const supported = Object.entries(VIS_DEFS).reduce<Vis[]>(
    (arr, [vis, { supportsDataset }]) => {
      return supportsDataset(dataset) ? [...arr, vis as Vis] : arr;
    },
    []
  );

  // Remove Raw vis if any other vis is supported
  return supported.length > 1 ? supported.slice(1) : supported;
}
