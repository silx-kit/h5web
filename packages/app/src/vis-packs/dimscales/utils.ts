import { hasArrayShape, hasNumericType, isDataset } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type Entity,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';

import { areSameDims } from '../nexus/utils';

/* A `FetchStore` signals both "still loading" and "failed" by throwing: a
 * promise in the first case, the error itself in the second. Suspense needs the
 * promise to propagate, but a scale that cannot be read must not take the whole
 * visualisation down with it, so the error is swallowed and the caller falls
 * back to the index axis. */
export function tryFetch<T>(fetch: () => T): T | undefined {
  try {
    return fetch();
  } catch (error) {
    if (error instanceof Promise) {
      throw error; // suspense
    }

    return undefined;
  }
}

/* `DIMENSION_LIST` allows several scales per dimension, but H5Web can plot only
 * one, so callers take the first that satisfies this. Rejecting the first scale
 * outright would lose the axis for a dimension that legally carries, say, N+1
 * bin boundaries alongside N bin centres.
 *
 * To be plottable, a scale must be 1D and have as many values as the dimension
 * it is attached to. The spec requires neither - it allows a scale of "any rank
 * and shape" and leaves it "up to the application to interpret or resolve the
 * difference" - so an unusable scale is ignored in favour of the index axis
 * rather than surfaced as an error. See the Storage Profile section of
 * https://support.hdfgroup.org/documentation/hdf5/latest/_h5_d_s__u_g.html */
export function isUsableScale(
  entity: Entity | undefined,
  dimSize: number,
): entity is Dataset<ArrayShape, NumericType> {
  return (
    entity !== undefined &&
    isDataset(entity) &&
    hasArrayShape(entity) &&
    hasNumericType(entity) &&
    areSameDims(entity.shape.dims, [dimSize])
  );
}

/* Build the axis label from the dimension label, falling back to the scale's
 * own name, mirroring what NeXus does with `long_name` (cf. #1435). */
export function getScaleLabel(
  dimLabel: string | undefined,
  scaleName: string | undefined,
  scaleDatasetName: string | undefined,
  units: string | undefined,
): string | undefined {
  const base = dimLabel || scaleName || scaleDatasetName;

  if (!base) {
    return units && `(${units})`;
  }

  return units ? `${base} (${units})` : base;
}

/* Dimension labels are useful on their own, even when no scale is attached -
 * they name the dimensions in the axis mapper. `DIMENSION_LABELS` may be
 * shorter than the dataset's rank, and HDF5 writes an empty string for
 * dimensions left unlabelled. */
export function getDimensionLabels(
  labels: unknown,
  ndims: number,
): AxisMapping<string> {
  const labelArray = Array.isArray(labels) ? (labels as unknown[]) : [];

  return Array.from({ length: ndims }, (_, index) => {
    const label = labelArray[index];
    return typeof label === 'string' && label ? label : undefined;
  });
}
