import { format } from 'd3-format';
import type {
  Entity,
  GroupWithChildren,
  H5WebComplex,
} from './providers/models';
import type { ImageAttribute } from './vis-packs/core/models';
import type { NxAttribute } from './vis-packs/nexus/models';

export const formatTick = format('.5~g');
export const formatBound = format('.3~e');
export const formatBoundInput = format('.5~e');
export const formatTooltipVal = format('.5~g');
export const formatTooltipErr = format('.3~g');
export const formatMatrixValue = format('.3e');
export const formatMatrixComplex = createComplexFormatter('.2e', true);
export const formatScalarComplex = createComplexFormatter('.12~g');

function createComplexFormatter(specifier: string, full = false) {
  const formatVal = format(specifier);

  return (value: H5WebComplex) => {
    const [real, imag] = value;

    if (imag === 0 && !full) {
      return `${formatVal(real)}`;
    }

    if (real === 0 && !full) {
      return `${formatVal(imag)} i`;
    }

    const sign = Math.sign(imag) >= 0 ? ' + ' : ' − ';
    return `${formatVal(real)}${sign}${formatVal(Math.abs(imag))} i`;
  };
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
