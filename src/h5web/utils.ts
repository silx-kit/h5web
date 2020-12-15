import { MyHDF5Entity, MyHDF5Group } from './providers/models';
import { isGroup } from './guards';

function findRoot(entity: MyHDF5Entity): MyHDF5Entity {
  const { parent } = entity;
  return parent ? findRoot(parent) : entity;
}

export function getChildEntity(
  group: MyHDF5Group,
  entityName: string
): MyHDF5Entity | undefined {
  return group.children.find((child) => child.name === entityName);
}

export function getEntityAtPath(
  baseGroup: MyHDF5Group,
  path: string,
  allowSelf = true
): MyHDF5Entity | undefined {
  const isAbsolutePath = path.startsWith('/');
  const startingGroup = isAbsolutePath ? findRoot(baseGroup) : baseGroup;

  if (path === '/' || path === '') {
    return allowSelf || startingGroup !== baseGroup ? startingGroup : undefined;
  }

  const pathSegments = path.slice(isAbsolutePath ? 1 : 0).split('/');
  return pathSegments.reduce<MyHDF5Entity | undefined>(
    (parentEntity, currSegment) => {
      return parentEntity && isGroup(parentEntity)
        ? getChildEntity(parentEntity, currSegment)
        : undefined;
    },
    startingGroup
  );
}

export function getParents(
  entity: MyHDF5Entity,
  prevParents: MyHDF5Group[] = []
): MyHDF5Group[] {
  const { parent } = entity;
  return parent ? getParents(parent, [parent, ...prevParents]) : prevParents;
}
