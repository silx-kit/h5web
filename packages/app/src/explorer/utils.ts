import type { AttributeValues, Entity } from '@h5web/shared';
import { isGroup, assertStr } from '@h5web/shared';
import type { FetchStore } from 'react-suspense-fetch';

import { hasAttribute } from '../utils';

const SUPPORTED_NX_CLASSES = new Set(['NXdata', 'NXentry', 'NXprocess']);

export function needsNxBadge(
  entity: Entity,
  attrValuesStore: FetchStore<AttributeValues, Entity>
): boolean {
  if (!isGroup(entity)) {
    return false;
  }

  if (hasAttribute(entity, 'default')) {
    return true;
  }

  if (hasAttribute(entity, 'NX_class')) {
    const attrValues = attrValuesStore.get(entity);
    const nxClass = attrValues?.NX_class;

    assertStr(nxClass);
    return SUPPORTED_NX_CLASSES.has(nxClass);
  }

  return false;
}
