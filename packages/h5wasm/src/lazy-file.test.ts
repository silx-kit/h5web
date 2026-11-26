import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BLOCK_SIZE as MiB,
  fetchFirstBlock,
  type FileVersion,
  LazyFile,
  MAX_CACHED_BLOCKS,
  MAX_REQUEST_BLOCKS,
  parseContentRange,
  REQUEST_TIMEOUT,
} from './lazy-file';

const FILE = Uint8Array.from({ length: 3.5 * MiB }, (_, i) => i % 251);
const VERSION: FileVersion = { etag: '"v1"', lastModified: null };

let requestedRanges: string[];
let ignoreRange: boolean;
let responseHeaders: Record<string, string>;
let shiftRange: number;
let timeouts: number[];
let timeOut: boolean;
let onSend: (() => void) | undefined;
let fileSize: number; // may be larger than `FILE`, in which case extra bytes are zeros

class FakeXMLHttpRequest {
  public status = 0;
  public response: ArrayBuffer | undefined;
  public responseType = '';
  public timeout = 0;
  private range = '';

  public open(): void {
    // no-op
  }

  public setRequestHeader(_: string, value: string): void {
    this.range = value;
  }

  public getResponseHeader(name: string): string | null {
    return responseHeaders[name] ?? null;
  }

  public send(): void {
    requestedRanges.push(this.range);
    timeouts.push(this.timeout);
    onSend?.();

    if (timeOut) {
      throw new DOMException('Failed to load', 'TimeoutError');
    }

    if (ignoreRange) {
      this.status = 200;
      this.response = FILE.buffer;
      return;
    }

    const [, start, end] = /bytes=(\d+)-(\d+)/u.exec(this.range) || [];
    const bytes = new Uint8Array(Number(end) - Number(start) + 1);
    bytes.set(FILE.subarray(Number(start), Number(end) + 1));

    this.status = 206;
    this.response = bytes.buffer;
    responseHeaders['Content-Range'] =
      `bytes ${Number(start) + shiftRange}-${Number(end) + shiftRange}/${fileSize}`;
  }
}

beforeEach(() => {
  requestedRanges = [];
  ignoreRange = false;
  responseHeaders = { ETag: '"v1"' };
  shiftRange = 0;
  timeouts = [];
  timeOut = false;
  onSend = undefined;
  fileSize = FILE.length;
  vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(
  handler: (init?: RequestInit) => Response | Promise<Response>,
) {
  const fetchMock = vi.fn<typeof fetch>(async (_, init) => handler(init));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function hasRange(init?: RequestInit): boolean {
  return !!init?.headers && 'Range' in init.headers;
}

function read(file: LazyFile, position: number, length: number): Uint8Array {
  const buffer = new Uint8Array(length);
  const bytesRead = file.read(buffer, 0, length, position);
  return buffer.subarray(0, bytesRead);
}

function expectFileBytes(bytes: Uint8Array, start: number, end: number): void {
  expect(bytes).toHaveLength(end - start);
  expect(bytes.every((val, i) => val === FILE[start + i])).toBe(true); // faster than `toEqual` on large arrays
}

describe('LazyFile', () => {
  it('read bytes across blocks, fetching consecutive missing blocks at once', () => {
    const file = new LazyFile('file.h5', FILE.length, VERSION);

    expectFileBytes(read(file, MiB - 10, MiB + 20), MiB - 10, 2 * MiB + 10);
    expect(requestedRanges).toEqual([`bytes=0-${3 * MiB - 1}`]);
    expect(timeouts).toEqual([REQUEST_TIMEOUT]);
  });

  it('read bytes from cache', () => {
    const file = new LazyFile(
      'file.h5',
      FILE.length,
      VERSION,
      FILE.slice(0, MiB),
    );

    expectFileBytes(read(file, 100, 50), 100, 150);
    expect(requestedRanges).toEqual([]);

    read(file, 2 * MiB, 10);
    read(file, 0, 3 * MiB);
    expect(requestedRanges).toEqual([
      `bytes=${2 * MiB}-${3 * MiB - 1}`,
      `bytes=${MiB}-${2 * MiB - 1}`,
    ]);
  });

  it('stop reading at end of file', () => {
    const file = new LazyFile('file.h5', FILE.length, VERSION);

    expectFileBytes(read(file, 3 * MiB, MiB), 3 * MiB, FILE.length);
    expect(requestedRanges).toEqual([`bytes=${3 * MiB}-${FILE.length - 1}`]);
    expect(read(file, FILE.length, 10)).toHaveLength(0);
  });

  it('split large reads into multiple requests and bypass cache', () => {
    const size = (MAX_REQUEST_BLOCKS + 4) * MiB;
    fileSize = size;
    const file = new LazyFile('big.h5', size, VERSION, FILE.slice(0, MiB));

    const buffer = new Uint8Array(size);
    expect(file.read(buffer, 0, size, 0)).toBe(size);
    expect(requestedRanges).toEqual([
      `bytes=0-${MAX_REQUEST_BLOCKS * MiB - 1}`,
      `bytes=${MAX_REQUEST_BLOCKS * MiB}-${size - 1}`,
    ]);

    // First block remains cached; others were not cached
    read(file, 0, 10);
    read(file, 2 * MiB, 10);
    expect(requestedRanges).toHaveLength(3);
  });

  it('fetch exact range of large unaligned reads', () => {
    const size = 3 * MAX_REQUEST_BLOCKS * MiB;
    fileSize = size;
    const file = new LazyFile('big.h5', size, VERSION);

    // e.g. two consecutive dataset chunks of `MAX_REQUEST_BLOCKS` MiB, not aligned with blocks
    const chunkSize = MAX_REQUEST_BLOCKS * MiB;
    const start = MiB / 2;
    const buffer = new Uint8Array(chunkSize);
    expect(file.read(buffer, 0, chunkSize, start)).toBe(chunkSize);
    expectFileBytes(
      buffer.subarray(0, FILE.length - start),
      start,
      FILE.length,
    );
    expect(file.read(buffer, 0, chunkSize, start + chunkSize)).toBe(chunkSize);

    expect(requestedRanges).toEqual([
      `bytes=${start}-${start + chunkSize - 1}`,
      `bytes=${start + chunkSize}-${start + 2 * chunkSize - 1}`,
    ]);
    expect(file['cache'].size).toBe(0); // eslint-disable-line @typescript-eslint/dot-notation
  });

  it('cache blocks in their own buffers', () => {
    const file = new LazyFile('file.h5', FILE.length, VERSION);
    read(file, 0, 3 * MiB); // single request

    const cache = file['cache']; // eslint-disable-line @typescript-eslint/dot-notation, @typescript-eslint/prefer-destructuring
    expect(cache.size).toBe(3);
    for (const block of cache.values()) {
      expect(block.buffer.byteLength).toBe(MiB); // not a view of the entire response
    }
  });

  it('write each fetched run to destination before fetching next one', () => {
    const size = 3 * MAX_REQUEST_BLOCKS * MiB;
    fileSize = size;
    const file = new LazyFile('big.h5', size, VERSION);

    const buffer = new Uint8Array(size).fill(255); // `FILE` contains no 255 values
    const filledPerRequest: number[] = [];
    onSend = () => {
      filledPerRequest.push(buffer.indexOf(255));
    };

    expect(file.read(buffer, 0, size, 0)).toBe(size);
    expect(filledPerRequest).toEqual([
      0,
      MAX_REQUEST_BLOCKS * MiB,
      2 * MAX_REQUEST_BLOCKS * MiB,
    ]);
    expect(file['cache'].size).toBe(0); // eslint-disable-line @typescript-eslint/dot-notation
  });

  it('evict least recently used blocks', () => {
    const size = (MAX_CACHED_BLOCKS + 1) * MiB;
    fileSize = size;
    const file = new LazyFile('big.h5', size, VERSION);

    for (let i = 0; i <= MAX_CACHED_BLOCKS; i += 1) {
      read(file, i * MiB, 1);
    }

    read(file, MAX_CACHED_BLOCKS * MiB, 1); // cached
    read(file, 0, 1); // evicted
    expect(requestedRanges).toHaveLength(MAX_CACHED_BLOCKS + 2);
  });

  it('throw if server does not return partial content', () => {
    ignoreRange = true;
    const file = new LazyFile('file.h5', FILE.length, VERSION);

    expect(() => read(file, 0, 10)).toThrow(/Expected partial content/u);
  });

  it('throw if file changed on server', () => {
    const file = new LazyFile('file.h5', FILE.length, VERSION);
    responseHeaders.ETag = '"v2"';
    expect(() => read(file, 0, 10)).toThrow(/File changed on server/u);

    const file2 = new LazyFile('file.h5', FILE.length, {
      etag: null,
      lastModified: 'Mon, 12 Oct 2026 10:00:00 GMT',
    });
    responseHeaders = { 'Last-Modified': 'Mon, 12 Oct 2026 11:00:00 GMT' };
    expect(() => read(file2, 0, 10)).toThrow(/File changed on server/u);

    const file3 = new LazyFile('file.h5', FILE.length, VERSION);
    responseHeaders = {};
    fileSize = FILE.length + 1;
    expect(() => read(file3, 0, 10)).toThrow(/File changed on server/u); // size in `Content-Range` differs
  });

  it('throw if request times out', () => {
    timeOut = true;
    const file = new LazyFile('file.h5', FILE.length, VERSION);
    expect(() => read(file, 0, 10)).toThrow(
      `Could not fetch range 0-1048575 of file.h5: timed out after ${REQUEST_TIMEOUT / 1000}s`,
    );
  });

  it('throw if server returns wrong range', () => {
    shiftRange = 1;
    const file = new LazyFile('file.h5', FILE.length, VERSION);
    expect(() => read(file, 0, 10)).toThrow(/Expected range 0-1048575/u);
  });
});

describe('parseContentRange', () => {
  it('parse Content-Range header', () => {
    expect(parseContentRange('bytes 0-99/1000')).toEqual({
      start: 0,
      end: 99,
      size: 1000,
    });
    expect(parseContentRange('bytes 10-99/*')).toEqual({
      start: 10,
      end: 99,
      size: undefined,
    });
    expect(parseContentRange(null)).toBeUndefined();
    expect(parseContentRange('bytes */1000')).toBeUndefined();
  });
});

describe('fetchFirstBlock', () => {
  it('return first block, size and version', async () => {
    mockFetch(
      () =>
        new Response(FILE.slice(0, MiB), {
          status: 206,
          headers: {
            'Content-Range': `bytes 0-${MiB - 1}/${FILE.length}`,
            ETag: '"v1"',
          },
        }),
    );

    const result = await fetchFirstBlock('file.h5');
    expect(result).toMatchObject({
      isPartial: true,
      size: FILE.length,
      version: { etag: '"v1"', lastModified: null },
    });
  });

  it('get size from HEAD request if Content-Range is not exposed', async () => {
    const fetchMock = mockFetch((init) =>
      init?.method === 'HEAD'
        ? new Response(null, {
            headers: { 'Content-Length': String(FILE.length) },
          })
        : new Response(FILE.slice(0, MiB), { status: 206 }),
    );

    const result = await fetchFirstBlock('file.h5');
    expect(result).toMatchObject({ isPartial: true, size: FILE.length });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reject implausible size from HEAD request', async () => {
    mockFetch((init) =>
      init?.method === 'HEAD'
        ? new Response(null, { headers: { 'Content-Length': '1000' } }) // e.g. compressed size
        : new Response(FILE.slice(0, MiB), { status: 206 }),
    );

    await expect(fetchFirstBlock('file.h5')).rejects.toThrow(
      /Could not determine size/u,
    );
  });

  it('return entire file if server ignores range', async () => {
    mockFetch(() => new Response(FILE.slice(0, 100)));

    const result = await fetchFirstBlock('file.h5');
    expect(result).toMatchObject({ isPartial: false });
  });

  it('fall back to fetching entire file if range request is rejected', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      // no-op
    });
    const fetchMock = mockFetch((init) => {
      if (hasRange(init)) {
        throw new TypeError('Failed to fetch'); // e.g. `Range` header not allowed by CORS policy
      }
      return new Response(FILE.slice(0, 100));
    });

    const result = await fetchFirstBlock('file.h5');
    expect(result).toMatchObject({ isPartial: false });
    expect(fetchMock).toHaveBeenCalledTimes(3); // ranged GET, HEAD, GET
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('throw original error if server is unreachable', async () => {
    const error = new TypeError('Failed to fetch');
    const fetchMock = mockFetch(() => {
      throw error;
    });

    await expect(fetchFirstBlock('file.h5')).rejects.toThrow(
      expect.objectContaining({
        message: 'Could not fetch file.h5: Failed to fetch',
        cause: error,
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2); // ranged GET, HEAD
  });

  it('throw if request fails', async () => {
    mockFetch(
      () => new Response(null, { status: 404, statusText: 'Not Found' }),
    );

    await expect(fetchFirstBlock('file.h5')).rejects.toThrow(
      'Could not fetch file.h5: 404 Not Found',
    );
  });
});
