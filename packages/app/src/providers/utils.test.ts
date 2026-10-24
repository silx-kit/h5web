import { type AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { createAxiosFetcher, createBasicFetcher, FetcherError } from './utils';

const TOO_LARGE_HINT = 'may be too large to be loaded in the browser';

function createErroringBody(): ReadableStream {
  return new ReadableStream({
    pull: (controller) => {
      controller.error(new TypeError('Failed to fetch'));
    },
  });
}

describe('createBasicFetcher', () => {
  it('should return response body as buffer', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3])),
    );

    const buffer = await createBasicFetcher()('/data', {});
    expect(new Uint8Array(buffer)).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('should throw if response body cannot be read', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(createErroringBody(), {
        headers: { 'content-length': '2000000' },
      }),
    );

    const promise = createBasicFetcher()('/data', {});
    await expect(promise).rejects.toThrow(/^Failed to read response$/u);
  });

  it('should hint that data may be too large if large response body cannot be read', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(createErroringBody(), {
        headers: { 'content-length': '2400000000' },
      }),
    );

    const promise = createBasicFetcher()('/data', {});
    await expect(promise).rejects.toThrow(
      `Failed to read response of 2.4 GB; the requested data ${TOO_LARGE_HINT}`,
    );
  });

  it('should keep HTTP status if error response body cannot be read', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(createErroringBody(), {
        status: 404,
        statusText: 'Not Found',
      }),
    );

    const promise = createBasicFetcher()('/data', {});
    await expect(promise).rejects.toBeInstanceOf(FetcherError);
    await expect(promise).rejects.toMatchObject({ status: 404 });
  });
});

describe('createAxiosFetcher', () => {
  it('should throw if response data is null', async () => {
    // XHR gives `null` when response is too large to be allocated
    const axiosInstance = Object.assign(
      async () => ({ data: null, headers: {} }),
      { defaults: {} },
    ) as unknown as AxiosInstance;

    await expect(
      createAxiosFetcher(axiosInstance)('/data', {}),
    ).rejects.toThrow(
      `Failed to read response; the requested data ${TOO_LARGE_HINT}`,
    );
  });
});
