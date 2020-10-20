import { useContext } from 'react';
import type { HDF5Entity } from '../providers/models';
import { Vis } from './models';
import { VIS_DEFS } from '../visualizations';
import { ProviderContext } from '../providers/context';

export function useSupportedVis(entity?: HDF5Entity): Vis[] {
  const { metadata } = useContext(ProviderContext);

  if (!entity) {
    return [];
  }

  const supported = Object.entries(VIS_DEFS).reduce<Vis[]>(
    (arr, [vis, { supportsEntity }]) => {
      return supportsEntity(entity, metadata) ? [...arr, vis as Vis] : arr;
    },
    []
  );

  // Remove Raw vis if any other vis is supported
  return supported.length > 1
    ? supported.filter((vis) => vis !== Vis.Raw)
    : supported;
}
