import {
  assertDefined,
  assertNonNull,
  assertStr,
  isGroup,
} from '@h5web/shared/guards';
import { type ChildEntity } from '@h5web/shared/hdf5-models';
import { type KeyboardEvent } from 'react';

import { type AttrValuesStore } from '../providers/models';
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

function getButtonList(
  parent = document.querySelector(`#${EXPLORER_ID}`),
): HTMLButtonElement[] {
  assertNonNull(parent);
  return [...parent.querySelectorAll('button')];
}

export function focusParent(evt: KeyboardEvent<HTMLButtonElement>): void {
  const activeElement = evt.currentTarget;
  const { path } = activeElement.dataset;
  assertDefined(path);

  const buttonList = getButtonList();
  const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';

  const parentButton = buttonList.find(
    (element) => element.dataset.path === parentPath,
  );
  if (parentButton) {
    parentButton.focus();
    evt.preventDefault();
  }
}

export function focusNext(
  evt: KeyboardEvent<HTMLButtonElement>,
  childOnly = false,
): void {
  const activeElement = evt.currentTarget;
  const parent = childOnly ? activeElement.parentElement : undefined;
  const buttonList = getButtonList(parent);
  const activeIndex = buttonList.indexOf(activeElement);

  if (activeIndex !== -1 && activeIndex < buttonList.length - 1) {
    buttonList[activeIndex + 1].focus();
    evt.preventDefault();
  }
}

export function focusPrevious(evt: KeyboardEvent<HTMLButtonElement>): void {
  const activeElement = evt.currentTarget;
  const buttonList = getButtonList();
  const activeIndex = buttonList.indexOf(activeElement);

  if (activeIndex > 0) {
    buttonList[activeIndex - 1].focus();
    evt.preventDefault();
  }
}

export function focusFirst(evt: KeyboardEvent<HTMLButtonElement>): void {
  const buttonList = getButtonList();

  buttonList[0]?.focus();
  evt.preventDefault();
}

export function focusLast(evt: KeyboardEvent<HTMLButtonElement>): void {
  const buttonList = getButtonList();

  buttonList[buttonList.length - 1]?.focus();
  evt.preventDefault();
}
