import type { Entity, Group } from './providers/models';
import { isGroup } from './guards';

function findRoot(entity: Entity): Entity {
  const { parent } = entity;
  return parent ? findRoot(parent) : entity;
}

export function getChildEntity(
  group: Group,
  entityName: string
): Entity | undefined {
  return group.children.find((child) => child.name === entityName);
}

export function getEntityAtPath(
  baseGroup: Group,
  path: string,
  allowSelf = true
): Entity | undefined {
  const isAbsolutePath = path.startsWith('/');
  const startingGroup = isAbsolutePath ? findRoot(baseGroup) : baseGroup;

  if (path === '/' || path === '') {
    return allowSelf || startingGroup !== baseGroup ? startingGroup : undefined;
  }

  const pathSegments = path.slice(isAbsolutePath ? 1 : 0).split('/');
  return pathSegments.reduce<Entity | undefined>(
    (parentEntity, currSegment) => {
      return parentEntity && isGroup(parentEntity)
        ? getChildEntity(parentEntity, currSegment)
        : undefined;
    },
    startingGroup
  );
}
