import { format } from 'd3-format';
import type { Entity, Group, H5WebComplex } from './providers/models';

export const formatValue = format('.3~e');
export const formatPreciseValue = format('.5~e');
export function formatComplexValue(value: H5WebComplex, specifier = '') {
  const [real, imag] = value;
  if (real === 0) {
    return `${format(specifier)(imag)}i`;
  }

  const formatFn = format(specifier);
  return `${formatFn(real)}${imag >= 0 ? '+' : ''}${formatFn(imag)}i`;
}

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
