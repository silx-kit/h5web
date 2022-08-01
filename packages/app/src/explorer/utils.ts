import type { ChildEntity } from '@h5web/shared';
import { isGroup, assertStr } from '@h5web/shared';

import type { AttrValuesStore } from '../providers/models';
import { hasAttribute } from '../utils';

const SUPPORTED_NX_CLASSES = new Set(['NXdata', 'NXentry', 'NXprocess']);

export function needsNxBadge(
  entity: ChildEntity,
  attrValuesStore: AttrValuesStore
): boolean {
  if (!isGroup(entity)) {
    return false;
  }

  if (hasAttribute(entity, 'default')) {
    return true;
  }

  const nxClass = attrValuesStore.getSingle(entity, 'NX_class');
  if (nxClass) {
    assertStr(nxClass);
    return SUPPORTED_NX_CLASSES.has(nxClass);
  }

  return false;
}
