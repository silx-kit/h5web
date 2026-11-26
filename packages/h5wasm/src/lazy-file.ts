export const BLOCK_SIZE = 1024 * 1024; // 1 MiB
export const MAX_CACHED_BLOCKS = 64; // i.e. up to 64 MiB of cached file content per file
export const MAX_REQUEST_BLOCKS = 16; // max size of a single range request, and max size of a read whose blocks get cached
export const REQUEST_TIMEOUT = 30_000; // ms

// Headers used to detect that the file has changed on the server since it was opened
export interface FileVersion {
  etag: string | null; // readable cross-origin only if exposed by the server
  lastModified: string | null; // CORS-safelisted
}

/* Read-only view of a remote file that fetches byte ranges on demand with
 * synchronous HTTP range requests (which are only allowed in Web Workers) and
 * keeps recently fetched blocks in an LRU cache. */
export class LazyFile {
  private readonly cache = new Map<number, Uint8Array>(); // insertion order = LRU order

  public constructor(
    public readonly url: string,
    public readonly size: number,
    private readonly version: FileVersion,
    firstBlock?: Uint8Array,
  ) {
    if (firstBlock?.length === Math.min(BLOCK_SIZE, size)) {
      this.cache.set(0, firstBlock);
    }
  }

  public read(
    buffer: Uint8Array,
    offset: number,
    length: number,
    position: number,
  ): number {
    if (position >= this.size || length <= 0) {
      return 0;
    }

    const end = Math.min(position + length, this.size);
    const firstIndex = Math.floor(position / BLOCK_SIZE);
    const lastIndex = Math.floor((end - 1) / BLOCK_SIZE);

    /* Large reads (e.g. of big dataset chunks) bypass the cache, so they don't evict all cached
     * blocks (e.g. metadata). Fetch exactly the requested range rather than whole blocks, as
     * partial blocks at either end would not be cached, so would be fetched again by adjacent
     * reads (e.g. of the next chunk). */
    if (lastIndex - firstIndex + 1 > MAX_REQUEST_BLOCKS) {
      const maxRequestSize = MAX_REQUEST_BLOCKS * BLOCK_SIZE;
      for (let start = position; start < end; start += maxRequestSize) {
        const bytes = this.fetchRange(
          start,
          Math.min(start + maxRequestSize, end),
        );
        buffer.set(bytes, offset + start - position);
      }
      return end - position;
    }

    // Copy bytes that fall within the requested range to the destination buffer
    function copy(chunkStart: number, chunk: Uint8Array): void {
      const from = Math.max(position, chunkStart);
      const to = Math.min(end, chunkStart + chunk.length);
      buffer.set(
        chunk.subarray(from - chunkStart, to - chunkStart),
        offset + from - position,
      );
    }

    let index = firstIndex;
    while (index <= lastIndex) {
      const cached = this.cache.get(index);
      if (cached) {
        this.cache.delete(index); // move to end of LRU order
        this.cache.set(index, cached);
        copy(index * BLOCK_SIZE, cached);
        index += 1;
        continue;
      }

      // Fetch consecutive missing blocks together
      let runEnd = index;
      while (
        runEnd < lastIndex &&
        runEnd - index + 1 < MAX_REQUEST_BLOCKS &&
        !this.cache.has(runEnd + 1)
      ) {
        runEnd += 1;
      }

      const runStart = index * BLOCK_SIZE;
      const bytes = this.fetchRange(
        runStart,
        Math.min((runEnd + 1) * BLOCK_SIZE, this.size),
      );

      // Consume response right away so it can be garbage-collected before next request
      copy(runStart, bytes);

      for (let i = index; i <= runEnd; i += 1) {
        const blockOffset = (i - index) * BLOCK_SIZE;
        // Copy block so cache doesn't retain entire response
        this.cacheBlock(i, bytes.slice(blockOffset, blockOffset + BLOCK_SIZE));
      }

      index = runEnd + 1;
    }

    return end - position;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  private cacheBlock(index: number, block: Uint8Array): void {
    this.cache.set(index, block);

    if (this.cache.size > MAX_CACHED_BLOCKS) {
      const [oldestIndex] = this.cache.keys();
      this.cache.delete(oldestIndex);
    }
  }

  private fetchRange(start: number, end: number): Uint8Array {
    const range = `${start}-${end - 1}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.url, false);
    xhr.setRequestHeader('Range', `bytes=${range}`);
    xhr.responseType = 'arraybuffer';
    xhr.timeout = REQUEST_TIMEOUT; // allowed for synchronous requests in workers

    try {
      xhr.send();
    } catch (error) {
      const reason =
        error instanceof DOMException && error.name === 'TimeoutError'
          ? `timed out after ${REQUEST_TIMEOUT / 1000}s`
          : 'network error';
      throw new Error(
        `Could not fetch range ${range} of ${this.url}: ${reason}`,
        { cause: error },
      );
    }

    if (xhr.status !== 206) {
      throw new Error(
        `Expected partial content (206) when fetching range ${range} of ${this.url}, got status ${xhr.status}`,
      );
    }

    const etag = xhr.getResponseHeader('ETag');
    const lastModified = xhr.getResponseHeader('Last-Modified');
    const contentRange = parseContentRange(
      xhr.getResponseHeader('Content-Range'),
    );

    if (
      (this.version.etag && etag && etag !== this.version.etag) ||
      (this.version.lastModified &&
        lastModified &&
        lastModified !== this.version.lastModified) ||
      (contentRange?.size !== undefined && contentRange.size !== this.size)
    ) {
      throw new Error(
        `File changed on server since it was opened: ${this.url}`,
      );
    }

    if (
      contentRange &&
      (contentRange.start !== start || contentRange.end !== end - 1)
    ) {
      throw new Error(
        `Expected range ${range} of ${this.url}, got ${contentRange.start}-${contentRange.end}`,
      );
    }

    const bytes = new Uint8Array(xhr.response as ArrayBuffer);
    if (bytes.length !== end - start) {
      throw new Error(
        `Expected ${end - start} bytes when fetching range ${range} of ${this.url}, got ${bytes.length}`,
      );
    }

    return bytes;
  }
}

/* Request the first block of the file to check whether the server supports
 * range requests and to find out the size of the file. If the server ignores
 * the `Range` header, the whole file is returned instead. */
export async function fetchFirstBlock(url: string): Promise<
  | {
      isPartial: true;
      size: number;
      version: FileVersion;
      firstBlock: Uint8Array;
    }
  | { isPartial: false; buffer: ArrayBuffer }
> {
  const response = await fetchWithRangeFallback(
    url,
    `bytes=0-${BLOCK_SIZE - 1}`,
  );

  if (!response.ok) {
    throw new Error(
      `Could not fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  if (response.status !== 206) {
    return { isPartial: false, buffer: await response.arrayBuffer() };
  }

  const firstBlock = new Uint8Array(await response.arrayBuffer());
  const contentRange = parseContentRange(response.headers.get('Content-Range'));

  if (contentRange && contentRange.start !== 0) {
    throw new Error(`Expected range starting at 0 when fetching ${url}`);
  }

  const size = contentRange?.size ?? (await fetchFileSize(url));
  if (size === undefined) {
    throw new Error(
      `Could not determine size of ${url}; make sure the server exposes the Content-Range or Content-Length header (cf. Access-Control-Expose-Headers)`,
    );
  }

  // Sanity-check size obtained with `HEAD` request, which may be wrong if response is compressed
  if (
    size < firstBlock.length ||
    (firstBlock.length < BLOCK_SIZE && size !== firstBlock.length)
  ) {
    throw new Error(`Could not determine size of ${url}`);
  }

  const version = {
    etag: response.headers.get('ETag'),
    lastModified: response.headers.get('Last-Modified'),
  };

  return { isPartial: true, size, version, firstBlock };
}

async function fetchWithRangeFallback(
  url: string,
  range: string,
): Promise<Response> {
  try {
    return await fetch(url, { headers: { Range: range } });
  } catch (error) {
    /* The request may have been rejected because the server's CORS policy
     * doesn't allow the `Range` header. If the server can be reached without
     * it, fall back to fetching the entire file; otherwise (e.g. network
     * error, no CORS support at all), report the original error. */
    if (!(await isReachable(url))) {
      const message = error instanceof Error ? `: ${error.message}` : '';
      throw new Error(`Could not fetch ${url}${message}`, { cause: error });
    }

    // eslint-disable-next-line no-console
    console.warn(
      `Range request to ${url} failed; fetching entire file instead`,
      error,
    );
    return fetch(url);
  }
}

async function isReachable(url: string): Promise<boolean> {
  try {
    await fetch(url, { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
}

export function parseContentRange(
  header: string | null,
): { start: number; end: number; size?: number } | undefined {
  // e.g. `bytes 0-1048575/5033458744` or `bytes 0-1048575/*` (not readable cross-origin unless exposed by the server)
  const [, start, end, size] =
    /^bytes (\d+)-(\d+)\/(\d+|\*)$/u.exec(header?.trim() || '') || [];

  if (!start || !end) {
    return undefined;
  }

  return {
    start: Number(start),
    end: Number(end),
    size: size && size !== '*' ? Number(size) : undefined,
  };
}

async function fetchFileSize(url: string): Promise<number | undefined> {
  const response = await fetch(url, { method: 'HEAD' });
  const length = response.ok && response.headers.get('Content-Length');
  return length ? Number(length) : undefined;
}
