import {
  assertAbsolutePath,
  assertGroup,
  assertGroupWithChildren,
  isGroup,
} from '@h5web/shared/guards';
import type {
  GroupWithChildren,
  ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { getChildEntity } from '@h5web/shared/hdf5-utils';

export function findMockEntity(
  group: GroupWithChildren,
  path: string,
): ProvidedEntity | undefined {
  assertAbsolutePath(path);

  if (path === '/') {
    return group;
  }

  const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
  const parent = findMockEntity(group, parentPath);
  if (!parent) {
    return undefined;
  }

  assertGroup(parent);
  const childName = path.slice(path.lastIndexOf('/') + 1);
  const child = parent && getChildEntity(parent, childName);

  if (child && isGroup(child)) {
    assertGroupWithChildren(child);
  }
  return child;
}
