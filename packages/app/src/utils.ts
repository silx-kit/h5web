import type { Entity } from '@h5web/shared/hdf5-models';

import type { AttrName } from './providers/models';

export function hasAttribute(entity: Entity, attributeName: AttrName) {
  return entity.attributes.some((attr) => attr.name === attributeName);
}
