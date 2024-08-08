import { isEnumType, isNumericType } from '@h5web/shared/guards';
import type {
  ArrayShape,
  Dataset,
  DType,
  ScalarShape,
} from '@h5web/shared/hdf5-models';
import { DTypeClass } from '@h5web/shared/hdf5-models';
import type { OnProgress } from '@h5web/shared/react-suspense-fetch';
import type { AxiosProgressEvent } from 'axios';
import { AxiosError } from 'axios';

import type { DataProviderApi } from './api';

export const CANCELLED_ERROR_MSG = 'Request cancelled';

export function typedArrayFromDType(dtype: DType) {
  if (isEnumType(dtype)) {
    return typedArrayFromDType(dtype.base);
  }

  if (!isNumericType(dtype)) {
    return undefined;
  }

  /* Adapted from https://github.com/ludwigschubert/js-numpy-parser/blob/v1.2.3/src/main.js#L116 */
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

export function processAxiosError(
  error: unknown,
  getMessageToThrow: (error: AxiosError) => string | false | undefined,
): unknown {
  if (error instanceof AxiosError) {
    const messageToThrow = getMessageToThrow(error);
    if (messageToThrow) {
      return new Error(messageToThrow, { cause: error });
    }
  }

  return error;
}

export function createAxiosProgressHandler(onProgress: OnProgress | undefined) {
  return (
    onProgress &&
    ((evt: AxiosProgressEvent) => {
      if (evt.total !== undefined && evt.total > 0) {
        onProgress(evt.loaded / evt.total);
      }
    })
  );
}
