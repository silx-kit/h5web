import { isValidElement, type ReactNode } from 'react';

import { type ReactElementWithKey } from './models';

export function isValidElementWithKey(
  node: ReactNode,
): node is ReactElementWithKey {
  return isValidElement(node) && node.key !== null;
}
