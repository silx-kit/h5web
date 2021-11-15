import type { Entity } from '@h5web/shared';
import { assertStr, isGroup } from '@h5web/shared';

import { getAttributeValue, hasAttribute } from '../utils';

const SUPPORTED_NX_CLASSES = new Set(['NXdata', 'NXentry', 'NXprocess']);

export function isNxGroup(entity: Entity): boolean {
  if (!isGroup(entity)) {
    return false;
  }

  if (hasAttribute(entity, 'default')) {
    return true;
  }

  if (hasAttribute(entity, 'NX_class')) {
    const nxClass = getAttributeValue(entity, 'NX_class');
    assertStr(nxClass);
    return SUPPORTED_NX_CLASSES.has(nxClass);
  }

  return false;
}
