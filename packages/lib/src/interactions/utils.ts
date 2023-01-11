import type { ModifierKey } from './models';

export function getModifierKeyArray(
  keys: ModifierKey | ModifierKey[] | undefined = []
): ModifierKey[] {
  return Array.isArray(keys) ? keys : [keys];
}
