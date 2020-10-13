import { useContext } from 'react';
import type { HDF5Link, HDF5Entity } from './models';
import { ProviderContext } from './context';
import { isReachable } from './utils';

export function useEntity(link?: HDF5Link): HDF5Entity | undefined {
  const { metadata } = useContext(ProviderContext);

  if (!link || !isReachable(link)) {
    return undefined;
  }

  const { collection, id } = link;
  const dict = metadata[collection];
  return dict && dict[id];
}
