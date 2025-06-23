import { type Axis, type DimensionMapping } from '@h5web/shared/vis-models';

export function initDimMapping(
  dims: number[],
  axesCount: number,
): DimensionMapping {
  if (axesCount < 0 || axesCount > 2) {
    throw new RangeError('Expected 0, 1 or 2 axes');
  }

  // Cap number of axes to number of dimensions
  const safeAxesCount = Math.min(axesCount, dims.length);

  return [
    ...Array.from({ length: dims.length - safeAxesCount }, () => 0),
    ...(safeAxesCount > 0
      ? ['y' as const, 'x' as const].slice(-safeAxesCount)
      : []),
  ];
}

export function getSliceSelection(
  dimMapping?: DimensionMapping,
): string | undefined {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (!dimMapping || !dimMapping.some((val) => typeof val === 'number')) {
    return undefined;
  }

  // Create slice selection string from dim mapping - e.g. [0, 'y', 'x'] => "0,:,:"
  return dimMapping.map((dim) => (isAxis(dim) ? ':' : dim)).join(',');
}

export function isAxis(elem: number | Axis): elem is Axis {
  return typeof elem !== 'number';
}

export function getSlicedDimsAndMapping(
  dims: number[],
  dimMapping: DimensionMapping,
): [number[], DimensionMapping] {
  return [
    dims.filter((_, i) => isAxis(dimMapping[i])),
    dimMapping.filter(isAxis),
  ];
}
