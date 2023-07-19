import { castArray } from 'lodash';

import type { ModifierKey } from './models';

export function getModifierKeyArray(
  keys: ModifierKey | ModifierKey[] | undefined = [],
): ModifierKey[] {
  return castArray(keys);
}
