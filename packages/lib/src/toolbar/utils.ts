import { isValidElement, type ReactNode } from 'react';

import { type ReactElementWithKey } from './models';

// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform
export const IS_MAC =
  'navigator' in globalThis && globalThis.navigator.platform.startsWith('Mac');

export function isValidElementWithKey(
  node: ReactNode,
): node is ReactElementWithKey {
  return isValidElement(node) && node.key !== null;
}
