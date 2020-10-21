import type { HDF5Entity, HDF5Metadata } from '../providers/models';
import { VIS_DEFS, Vis } from '../visualizations';

export function getSupportedVis(
  entity: HDF5Entity,
  metadata: HDF5Metadata
): Vis[] {
  const supported = Object.entries(VIS_DEFS).reduce<Vis[]>(
    (arr, visDefEntry) => {
      const [vis, { supportsEntity }] = visDefEntry;
      return supportsEntity(entity, metadata) ? [...arr, vis as Vis] : arr;
    },
    []
  );

  // Remove Raw vis if any other vis is supported
  return supported.length > 1
    ? supported.filter((vis) => vis !== Vis.Raw)
    : supported;
}
