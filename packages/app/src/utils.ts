import type { Entity } from '@h5web/shared';

import type { ImageAttribute } from './vis-packs/core/models';
import type { NxAttribute } from './vis-packs/nexus/models';

export function hasAttribute(
  entity: Entity,
  attributeName: NxAttribute | ImageAttribute
) {
  return entity.attributes.some((attr) => attr.name === attributeName);
}
