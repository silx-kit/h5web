import { HDF5Collection } from '../hdf5-models';
import { EntityKind } from '../models';
import type { HsdsLink, HsdsExternalLink } from './models';

export function isHsdsExternalLink(link: HsdsLink): link is HsdsExternalLink {
  return 'h5domain' in link;
}

export const COLLECTION_TO_KIND: Record<HDF5Collection, EntityKind> = {
  [HDF5Collection.Groups]: EntityKind.Group,
  [HDF5Collection.Datasets]: EntityKind.Dataset,
  [HDF5Collection.Datatypes]: EntityKind.Datatype,
};
