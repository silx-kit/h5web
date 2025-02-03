import {
  isBoolType,
  isEnumType,
  isFloatType,
  isIntegerType,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type DType,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';
import { type OnProgress } from '@h5web/shared/react-suspense-fetch';
import {
  type BigIntTypedArrayConstructor,
  type TypedArrayConstructor,
} from '@h5web/shared/vis-models';
import { type AxiosProgressEvent, isAxiosError } from 'axios';

import { type DataProviderApi } from './api';

export const CANCELLED_ERROR_MSG = 'Request cancelled';

export function typedArrayFromDType(
  dtype: DType,
): TypedArrayConstructor | undefined {
  if (isEnumType(dtype) || isBoolType(dtype)) {
    return typedArrayFromDType(dtype.base);
  }

  if (isIntegerType(dtype) && dtype.signed) {
    switch (dtype.size) {
      case 8:
        return Int8Array;
      case 16:
        return Int16Array;
      case 32:
        return Int32Array;
      case 64: // combine with `bigIntTypedArrayFromDType` when relevant
        return undefined;
    }
  }

  if (isIntegerType(dtype) && !dtype.signed) {
    switch (dtype.size) {
      case 8:
        return Uint8Array;
      case 16:
        return Uint16Array;
      case 32:
        return Uint32Array;
      case 64: // combine with `bigIntTypedArrayFromDType` when relevant
        return undefined;
    }
  }

  if (isFloatType(dtype)) {
    switch (dtype.size) {
      case 16: // no support for 16-bit floating values in JS
      case 128: // no support for 128-bit floating values in JS
        return undefined;
      case 32:
        return Float32Array;
      case 64:
        return Float64Array;
    }
  }

  return undefined;
}

export function bigIntTypedArrayFromDType(
  dtype: DType,
): BigIntTypedArrayConstructor | undefined {
  if (!isIntegerType(dtype) || dtype.size !== 64) {
    return undefined;
  }

  return dtype.signed ? BigInt64Array : BigUint64Array;
}

export async function getValueOrError(
  api: DataProviderApi,
  dataset: Dataset<ArrayShape | ScalarShape>,
): Promise<unknown> {
  try {
    return await api.getValue({ dataset });
  } catch (error) {
    return isAxiosError(error) ? error.message : error;
  }
}

export function createAxiosProgressHandler(
  onProgress: OnProgress | undefined,
): ((evt: AxiosProgressEvent) => void) | undefined {
  return (
    onProgress &&
    ((evt: AxiosProgressEvent) => {
      if (evt.total !== undefined && evt.total > 0) {
        onProgress(evt.loaded / evt.total);
      }
    })
  );
}
