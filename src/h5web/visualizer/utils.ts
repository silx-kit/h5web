import type { HDF5Entity, HDF5Metadata } from '../providers/models';
import { VIS_DEFS, Vis } from '../visualizations';

export function getSupportedVis(
  entity: HDF5Entity | undefined,
  metadata: HDF5Metadata
): { supportedVis: Vis[]; error?: Error } {
  if (!entity) {
    return { supportedVis: [] };
  }

  try {
    const supported = Object.entries(VIS_DEFS).reduce<Vis[]>(
      (arr, visDefEntry) => {
        const [vis, { supportsEntity }] = visDefEntry;
        return supportsEntity(entity, metadata) ? [...arr, vis as Vis] : arr;
      },
      []
    );

    // Remove Raw vis if any other vis is supported
    const supportedVis =
      supported.length > 1
        ? supported.filter((vis) => vis !== Vis.Raw)
        : supported;

    return { supportedVis };
  } catch (error) {
    return { supportedVis: [], error };
  }
}
