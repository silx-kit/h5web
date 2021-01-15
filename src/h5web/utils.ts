import type { Entity, Group, Metadata } from './providers/models';
import { assertAbsolutePath, isGroup } from './guards';

export function getChildEntity(
  group: Group,
  entityName: string
): Entity | undefined {
  return group.children.find((child) => child.name === entityName);
}

export function getEntityAtPath(
  root: Metadata,
  path: string,
  allowSelf = true
): Entity | undefined {
  assertAbsolutePath(path);

  if (path === '/') {
    return allowSelf ? root : undefined;
  }

  const pathSegments = path.slice(1).split('/');
  return pathSegments.reduce<Entity | undefined>(
    (parentEntity, currSegment) =>
      parentEntity && isGroup(parentEntity)
        ? getChildEntity(parentEntity, currSegment)
        : undefined,
    root
  );
}

export function buildEntityPath(
  parentPath: string,
  entityNameOrRelativePath: string
): string {
  const prefix = parentPath === '/' ? '' : parentPath;
  return `${prefix}/${entityNameOrRelativePath}`;
}
