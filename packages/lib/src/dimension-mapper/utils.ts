import { type DimensionMapping } from '@h5web/shared/vis-models';

export function initDimMapping(
  dims: number[],
  axesCount: number,
  lockedDimsCount = 0,
): DimensionMapping {
  if (axesCount < 0 || axesCount > 2) {
    throw new RangeError('Expected 0, 1 or 2 axes');
  }

  if (lockedDimsCount < 0) {
    throw new RangeError('Expected 0 or more locked dimensions');
  }

  // Cap requested number of axes and locked dimensions to number of actual dimensions
  const safeAxesCount = Math.min(axesCount, dims.length);
  const safeLockedDimsCount =
    Math.min(safeAxesCount + lockedDimsCount, dims.length) - safeAxesCount;

  return [
    ...Array.from(
      { length: dims.length - safeAxesCount - safeLockedDimsCount },
      () => 0,
    ),
    ...(safeAxesCount > 0
      ? ['y' as const, 'x' as const].slice(-safeAxesCount)
      : []),
    ...Array.from({ length: safeLockedDimsCount }, () => null),
  ];
}

export function getSliceSelection(
  dimMapping?: DimensionMapping,
): string | undefined {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (!dimMapping || !dimMapping.some((val) => typeof val === 'number')) {
    return undefined;
  }

  // Create slice selection string from dim mapping - e.g. [0, 'y', 'x', null] => "0,:,:,:"
  return dimMapping
    .map((dim) => (typeof dim === 'number' ? dim : ':'))
    .join(',');
}

export function getSlicedDimsAndMapping(
  dims: number[],
  dimMapping: DimensionMapping,
): [number[], DimensionMapping] {
  return [
    dims.filter((_, i) => typeof dimMapping[i] !== 'number'),
    dimMapping.filter((val) => typeof val !== 'number'),
  ];
}
