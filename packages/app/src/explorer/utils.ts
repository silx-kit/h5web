import {
  assertDefined,
  assertNonNull,
  hasNonNullShape,
  isDataset,
  isDatatype,
  isGroup,
} from '@h5web/shared/guards';
import { type ChildEntity } from '@h5web/shared/hdf5-models';
import { type KeyboardEvent } from 'react';
import { type IconType } from 'react-icons';
import {
  FiChevronDown,
  FiChevronRight,
  FiHash,
  FiLayers,
  FiLink,
} from 'react-icons/fi';
import { PiEmptyBold, PiGridFourBold } from 'react-icons/pi';
import { RxDotFilled } from 'react-icons/rx';
import { TbCube, TbTimeline } from 'react-icons/tb';

import { type AttrValuesStore } from '../providers/models';
import { hasAttribute } from '../utils';
import { getNxClass } from '../vis-packs/nexus/utils';

const DATASET_ICONS = [RxDotFilled, TbTimeline, PiGridFourBold, TbCube];
const SUPPORTED_NX_CLASSES = new Set(['NXdata', 'NXentry', 'NXprocess']);

export const EXPLORER_ID = 'h5web-explorer-tree';

export function getIcon(entity: ChildEntity, isExpanded: boolean): IconType {
  if (isGroup(entity)) {
    return isExpanded ? FiChevronDown : FiChevronRight;
  }

  if (isDataset(entity)) {
    if (hasNonNullShape(entity)) {
      return DATASET_ICONS[entity.shape.dims.length] || FiLayers;
    }

    return PiEmptyBold;
  }

  if (isDatatype(entity)) {
    return FiHash;
  }

  return FiLink;
}

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

  const nxClass = getNxClass(entity, attrValuesStore);
  return !!nxClass && SUPPORTED_NX_CLASSES.has(nxClass);
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
