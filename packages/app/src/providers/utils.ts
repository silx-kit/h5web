import type {
  ArrayShape,
  Dataset,
  DType,
  Primitive,
  ScalarShape,
} from '@h5web/shared';
import { assertArray } from '@h5web/shared';
import { AxiosError } from 'axios';
import ndarray from 'ndarray';

import { applyMapping } from '../vis-packs/core/utils';

export const CANCELLED_ERROR_MSG = 'Request cancelled';

export function flattenValue(
  value: unknown,
  dataset: Dataset<ArrayShape>,
  selection?: string
): unknown[] {
  assertArray(value);
  const slicedDims = selection?.split(',').filter((s) => s.includes(':'));
  const dims = slicedDims || dataset.shape;
  return value.flat(dims.length - 1);
}

export async function handleAxiosError<T>(
  func: () => Promise<T>,
  getErrorToThrow: (status: number, errorData: unknown) => string | undefined
): Promise<T> {
  try {
    return await func();
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const { status, data } = error.response;
      const errorToThrow = getErrorToThrow(status, data);

      if (errorToThrow) {
        throw new Error(errorToThrow);
      }
    }

    throw error;
  }
}

export function getNameFromPath(path: string) {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

export function sliceValue<T extends DType>(
  value: unknown,
  dataset: Dataset<ArrayShape | ScalarShape, T>,
  selection: string
): Primitive<T>[] {
  const { shape, type } = dataset;
  const dataArray = ndarray(value as Primitive<typeof type>[], shape);
  const mappedArray = applyMapping(
    dataArray,
    selection.split(',').map((s) => (s === ':' ? s : Number.parseInt(s, 10)))
  );

  return mappedArray.data;
}
