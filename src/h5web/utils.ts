import { format } from 'd3-format';
import type {
  Entity,
  GroupWithChildren,
  H5WebComplex,
} from './providers/models';
import type { ImageAttribute } from './vis-packs/core/models';
import type { NxAttribute } from './vis-packs/nexus/models';

export const formatValue = format('.3~e');
export const formatPreciseValue = format('.5~e');
export function formatComplex(value: H5WebComplex, specifier = '') {
  const [real, imag] = value;
  const formatFunction = format(specifier);

  if (imag === 0) {
    return `${formatFunction(real)}`;
  }

  if (real === 0) {
    return `${formatFunction(imag)}ⅈ`;
  }

  return `${formatFunction(real)}${
    Math.sign(imag) === 1 ? ' + ' : ' − '
  }${formatFunction(Math.abs(imag))}ⅈ`;
}

export function getChildEntity(
  group: GroupWithChildren,
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

export function handleError<T>(
  func: () => T,
  errToCatch: string,
  errToThrow: string
): T {
  try {
    return func();
  } catch (error: unknown) {
    if (error instanceof Error && error.message === errToCatch) {
      throw new Error(errToThrow);
    }

    throw error;
  }
}

export function getAttributeValue(
  entity: Entity,
  attributeName: NxAttribute | ImageAttribute
): unknown {
  return entity.attributes?.find((attr) => attr.name === attributeName)?.value;
}
