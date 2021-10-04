import type { Entity } from '@h5web/shared';

import type { ImageAttribute } from './vis-packs/core/models';
import type { NxAttribute } from './vis-packs/nexus/models';

export function getAttributeValue(
  entity: Entity,
  attributeName: NxAttribute | ImageAttribute
): unknown {
  return entity.attributes?.find((attr) => attr.name === attributeName)?.value;
}
