import { assertArray, isNumericType } from '@h5web/shared/guards';
import type {
  ArrayShape,
  Dataset,
  DType,
  Primitive,
  ScalarShape,
} from '@h5web/shared/hdf5-models';
import { DTypeClass } from '@h5web/shared/hdf5-models';
import { AxiosError } from 'axios';
import ndarray from 'ndarray';

import type { DataProviderApi } from '..';
import { applyMapping } from '../vis-packs/core/utils';

export const CANCELLED_ERROR_MSG = 'Request cancelled';

export function flattenValue(
  value: unknown,
  dataset: Dataset<ArrayShape>,
  selection?: string,
): unknown[] {
  assertArray(value);
  const slicedDims = selection?.split(',').filter((s) => s.includes(':'));
  const dims = slicedDims || dataset.shape;
  return value.flat(dims.length - 1);
}

export async function handleAxiosError<T>(
  func: () => Promise<T>,
  getErrorToThrow: (status: number, errorData: unknown) => string | undefined,
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
  selection: string,
): Primitive<T>[] {
  const { shape, type } = dataset;
  const dataArray = ndarray(value as Primitive<typeof type>[], shape);
  const mappedArray = applyMapping(
    dataArray,
    selection.split(',').map((s) => (s === ':' ? s : Number.parseInt(s, 10))),
  );

  return mappedArray.data;
}

export function typedArrayFromDType(dtype: DType) {
  /* Adapted from https://github.com/ludwigschubert/js-numpy-parser/blob/v1.2.3/src/main.js#L116 */
  if (!isNumericType(dtype)) {
    return undefined;
  }

  const { class: dtypeClass, size } = dtype;

  if (dtypeClass === DTypeClass.Integer) {
    switch (size) {
      case 8:
        return Int8Array;
      case 16:
        return Int16Array;
      case 32:
        return Int32Array;
      case 64: // No support for 64-bit integer values in JS
        return undefined;
    }
  }

  if (dtypeClass === DTypeClass.Unsigned) {
    switch (size) {
      case 8:
        return Uint8Array;
      case 16:
        return Uint16Array;
      case 32:
        return Uint32Array;
      case 64: // No support for 64-bit unsigned integer values in JS
        return undefined;
    }
  }

  if (dtypeClass === DTypeClass.Float) {
    switch (size) {
      case 16: // No support for 16-bit floating values in JS
        return undefined;
      case 32:
        return Float32Array;
      case 64:
        return Float64Array;
    }
  }

  return undefined;
}

export async function getValueOrError(
  api: DataProviderApi,
  dataset: Dataset<ArrayShape | ScalarShape>,
): Promise<unknown> {
  try {
    return await api.getValue({ dataset });
  } catch (error) {
    return error;
  }
}
