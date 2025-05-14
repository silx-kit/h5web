/* eslint-disable max-classes-per-file */
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
import { type AxiosInstance, type AxiosProgressEvent } from 'axios';

import { type DataProviderApi } from './api';
import { type AxiosError, type Fetcher, type FetcherOptions } from './models';

export const CANCELLED_BY_USER = 'Cancelled by user';

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
    return error instanceof FetcherError ? error.message : error;
  }
}

export function toJSON(buffer: ArrayBuffer): unknown {
  return JSON.parse(new TextDecoder().decode(buffer));
}

export function createBasicFetcher(): Fetcher {
  return async (
    url: string,
    params: Record<string, string>,
    opts: FetcherOptions = {},
  ): Promise<ArrayBuffer> => {
    const { abortSignal } = opts;
    const queryParams = new URLSearchParams(params);

    try {
      const response = await fetch(`${url}?${queryParams.toString()}`, {
        signal: abortSignal,
      });

      const buffer = await response.arrayBuffer();
      if (response.ok) {
        return buffer;
      }

      throw new FetcherError(response.status, response.statusText, buffer);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AbortError(abortSignal, error);
      }

      throw error;
    }
  };
}

export function createAxiosFetcher(axiosInstance: AxiosInstance): Fetcher {
  return async (
    url: string,
    params: Record<string, string>,
    opts: FetcherOptions = {},
  ): Promise<ArrayBuffer> => {
    const { abortSignal, onProgress } = opts;

    try {
      const { data } = await axiosInstance.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        params,
        signal: abortSignal,
        onDownloadProgress: createAxiosProgressHandler(onProgress),
      });
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'CanceledError') {
        throw new AbortError(abortSignal, error);
      }

      if (isAxiosError(error)) {
        const { status, statusText, data } = error.response;
        throw new FetcherError(status, statusText, data);
      }

      throw error;
    }
  };
}

function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof Error && 'isAxiosError' in error;
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

export class AbortError extends Error {
  public constructor(signal: AbortSignal | undefined, cause: unknown) {
    const message =
      typeof signal?.reason === 'string' ? signal.reason : undefined;

    super(message, { cause });
    this.name = 'AbortError';
  }
}

export class FetcherError extends Error {
  public constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly payload: ArrayBuffer,
    cause?: unknown,
  ) {
    super(`Request failed with status code ${status}`, { cause });
    this.name = 'FetcherError';
  }
}
