import { HDF5Link, HDF5LinkClass, HDF5HardLink } from './models';

export function isHardLink(link: HDF5Link): link is HDF5HardLink {
  return link.class === HDF5LinkClass.Hard;
}
