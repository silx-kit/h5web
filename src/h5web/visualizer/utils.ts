import type { Entity, Metadata } from '../providers/models';
import { VIS_DEFS, Vis } from '../visualizations';

const REDUNDANT_VIS = new Set([Vis.Raw, Vis.NxSpectrum]);

function removeRedundantVis(visArr: Vis[]): Vis[] {
  if (REDUNDANT_VIS.has(visArr[0]) && visArr.length > 1) {
    return visArr.slice(1);
  }

  return visArr;
}

export function getSupportedVis(
  entity: Entity | undefined,
  metadata: Metadata
): { supportedVis: Vis[]; error?: Error } {
  if (!entity) {
    return { supportedVis: [] };
  }

  try {
    const supportedVis = Object.entries(VIS_DEFS).reduce<Vis[]>(
      (arr, visDefEntry) => {
        const [vis, { supportsEntity }] = visDefEntry;
        return supportsEntity(entity, metadata) ? [...arr, vis as Vis] : arr;
      },
      []
    );

    return { supportedVis: removeRedundantVis(supportedVis) };
  } catch (error) {
    return { supportedVis: [], error };
  }
}
