import type { ChildEntity } from '@h5web/shared';
import { assertStr, isGroup } from '@h5web/shared';
import type { KeyboardEvent } from 'react';

import type { AttrValuesStore } from '../providers/models';
import { hasAttribute } from '../utils';

const SUPPORTED_NX_CLASSES = new Set(['NXdata', 'NXentry', 'NXprocess']);

export const EXPLORER_ID = 'h5web-explorer-tree';

export function needsNxBadge(
  entity: ChildEntity,
  attrValuesStore: AttrValuesStore,
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

function getExplorerButtonList(): HTMLButtonElement[] {
  const explorer = document.querySelector(`#${EXPLORER_ID}`);
  return [...(explorer?.querySelectorAll('button') || [])];
}

export function focusParent(e: KeyboardEvent<HTMLButtonElement>) {
  const activeElement = e.currentTarget;
  const path = activeElement.getAttribute('data-path');
  if (!path) {
    return;
  }
  const buttonList = getExplorerButtonList();
  const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';

  const parentButton = buttonList.find(
    (element) => element.getAttribute('data-path') === parentPath,
  );
  if (parentButton) {
    parentButton.focus();
    e.preventDefault();
  }
}

export function focusNext(e: KeyboardEvent<HTMLButtonElement>) {
  const activeElement = e.currentTarget;
  const buttonList = getExplorerButtonList();
  const activeIndex = buttonList.indexOf(activeElement);

  if (activeIndex >= 0 && activeIndex < buttonList.length - 1) {
    buttonList[activeIndex + 1].focus();
    e.preventDefault();
  }
}

export function focusPrevious(e: KeyboardEvent<HTMLButtonElement>) {
  const activeElement = e.currentTarget;
  const buttonList = getExplorerButtonList();
  const activeIndex = buttonList.indexOf(activeElement);

  if (activeIndex > 0) {
    buttonList[activeIndex - 1].focus();
    e.preventDefault();
  }
}

export function focusFirst(e: KeyboardEvent<HTMLButtonElement>) {
  const buttonList = getExplorerButtonList();

  buttonList[0]?.focus();
  e.preventDefault();
}

export function focusLast(e: KeyboardEvent<HTMLButtonElement>) {
  const buttonList = getExplorerButtonList();

  buttonList[buttonList.length - 1]?.focus();
  e.preventDefault();
}
