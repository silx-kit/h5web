import {
  isBoolType,
  isEnumType,
  isFloatType,
  isIntegerType,
} from '@h5web/shared/guards';
import { type DType } from '@h5web/shared/hdf5-models';
import {
  type BigIntTypedArrayConstructor,
  type TypedArrayConstructor,
} from '@h5web/shared/vis-models';
import { type AxiosError, type AxiosInstance } from 'axios';

import { type Fetcher, type FetcherOptions, type OnProgress } from './models';

// eslint-disable-next-line complexity
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
      case 16:
        return 'Float16Array' in globalThis
          ? globalThis.Float16Array
          : undefined;
      case 32:
        return Float32Array;
      case 64:
        return Float64Array;
      case 128: // no support for 128-bit floating values in JS
        return undefined;
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

export function toJSON(buffer: ArrayBuffer): unknown {
  try {
    return JSON.parse(new TextDecoder().decode(buffer));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new TypeError('Expected valid JSON', { cause: error });
    }
    throw error;
  }
}

// Failing to read a response this large is most likely due to the browser failing to allocate enough memory
const LARGE_RESPONSE_SIZE = 1024 ** 3; // 1 GiB

function createReadError(
  size: number | undefined,
  mayBeTooLarge: boolean,
  cause?: unknown,
): Error {
  if (!mayBeTooLarge) {
    return new Error('Failed to read response', { cause });
  }

  const sizeStr = size === undefined ? '' : ` of ${(size / 1e9).toFixed(1)} GB`;
  return new Error(
    `Failed to read response${sizeStr}; the requested data may be too large to be loaded in the browser`,
    { cause },
  );
}

function parseContentLength(
  contentLength: string | null | undefined,
): number | undefined {
  const size = contentLength ? Number.parseInt(contentLength, 10) : Number.NaN;
  return Number.isNaN(size) ? undefined : size;
}

export function createBasicFetcher(
  fetchOpts: {
    headers?: Record<string, string>;
  } & Omit<RequestInit, keyof FetcherOptions> = {},
): Fetcher {
  return async (
    url: string,
    params: Record<string, string>,
    opts: FetcherOptions = {},
  ): Promise<ArrayBuffer> => {
    const { headers: defaultHeaders, ...moreFetchOpts } = fetchOpts;
    const { method, headers, body, abortSignal, onProgress } = opts;
    const queryParams = new URLSearchParams(params);

    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body,
      signal: abortSignal,
      ...moreFetchOpts,
    });

    const tracked = trackProgress(response, onProgress);

    let buffer: ArrayBuffer;
    try {
      buffer = await tracked.arrayBuffer();
    } catch (error) {
      if (abortSignal?.aborted) {
        throw error;
      }

      if (!tracked.ok) {
        // Keep HTTP status so providers can still handle the error
        const { status, statusText } = tracked;
        throw new FetcherError(status, statusText, new ArrayBuffer(0), error);
      }

      const size = parseContentLength(response.headers.get('content-length'));
      const mayBeTooLarge = size !== undefined && size >= LARGE_RESPONSE_SIZE;
      throw createReadError(size, mayBeTooLarge, error);
    }

    if (tracked.ok) {
      return buffer;
    }

    throw new FetcherError(tracked.status, tracked.statusText, buffer);
  };
}

export function createAxiosFetcher(axiosInstance: AxiosInstance): Fetcher {
  return async (
    url: string,
    params: Record<string, string>,
    opts: FetcherOptions = {},
  ): Promise<ArrayBuffer> => {
    const { method, headers, body, abortSignal, onProgress } = opts;

    try {
      const res = await axiosInstance<ArrayBuffer | null>({
        url,
        method,
        headers,
        responseType: 'arraybuffer',
        params: { ...axiosInstance.defaults.params, ...params },
        data: body,
        signal: abortSignal,
        onDownloadProgress:
          onProgress &&
          ((evt) => {
            if (evt.total !== undefined && evt.total > 0) {
              onProgress(evt.loaded / evt.total);
            }
          }),
      });

      // XHR gives `null` when response body cannot be allocated (i.e. too large)
      if (!res.data) {
        const size = parseContentLength(
          res.headers['content-length']?.toString(),
        );
        throw createReadError(size, true);
      }

      return res.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const { status, statusText, data } = error.response;
        throw new FetcherError(status, statusText, data as ArrayBuffer, error);
      }

      throw error;
    }
  };
}

function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof Error && 'isAxiosError' in error;
}

// Inspired by https://github.com/elbywan/wretch/blob/master/src/addons/progress.ts
function trackProgress(response: Response, onProgress?: OnProgress): Response {
  const { body } = response;

  if (!body || !onProgress) {
    return response;
  }

  const total = parseContentLength(response.headers.get('content-length'));

  if (total === undefined) {
    return response;
  }

  let loaded = 0;

  try {
    const transform = new TransformStream<Uint8Array>({
      transform(chunk, controller) {
        loaded += chunk.length;

        onProgress(loaded / Math.max(loaded, total));
        controller.enqueue(chunk);
      },
    });

    return new Response(body.pipeThrough(transform), response);
  } catch {
    return response;
  }
}

export function buildBasicAuthHeader(
  username: string,
  password: string,
): Record<string, string> {
  return { Authorization: `Basic ${btoa(`${username}:${password}`)}` };
}

export class FetcherError extends Error {
  public constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly buffer: ArrayBuffer,
    cause?: unknown,
  ) {
    super(`Request failed: ${status} ${statusText}`, { cause });
    this.name = 'FetcherError';
  }
}
