import { format } from 'd3-format';
import type { Entity, Group } from './providers/models';

export const formatValue = format('.3~e');

export function getChildEntity(
  group: Group,
  entityName: string
): Entity | undefined {
  return group.children.find((child) => child.name === entityName);
}

export function buildEntityPath(
  parentPath: string,
  entityNameOrRelativePath: string
): string {
  const prefix = parentPath === '/' ? '' : parentPath;
  return `${prefix}/${entityNameOrRelativePath}`;
}
