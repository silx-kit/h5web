import { isDataset, isGroup } from '../../guards';
import type { Entity } from '../models';
import type {
  HsdsLink,
  HsdsExternalLink,
  HsdsDataset,
  HsdsGroup,
} from './models';

export function isHsdsExternalLink(link: HsdsLink): link is HsdsExternalLink {
  return 'h5domain' in link;
}

export function isHsdsGroup(entity: Entity): entity is HsdsGroup {
  return isGroup(entity);
}

export function assertHsdsDataset(
  entity: Entity
): asserts entity is HsdsDataset {
  if (!isDataset(entity)) {
    throw new Error('Expected entity to be HSDS dataset');
  }
}
