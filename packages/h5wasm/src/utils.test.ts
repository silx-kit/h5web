import { describe, expect, it } from 'vitest';

import { getFilenameFromUrl, parseDiagnostics, resolveUrl } from './utils';

const HDF5_ERROR_MESSAGE = `HDF5-DIAG: Error detected in HDF5 (1.14.2) thread 0:
  #000: /__w/libhdf5-wasm/libhdf5-wasm/build/1.14.2/_deps/hdf5-src/src/H5D.c line 1061 in H5Dread(): can't synchronously read data
    major: Dataset
    minor: Read failed
  #001: /__w/libhdf5-wasm/libhdf5-wasm/build/1.14.2/_deps/hdf5-src/src/H5VLcallback.c line 2092 in H5VL_dataset_read_direct(): dataset read failed
    major: Virtual Object Layer
    minor: Read failed
  #002: /__w/libhdf5-wasm/libhdf5-wasm/build/1.14.2/_deps/hdf5-src/src/H5Dchunk.c line 4468 in H5D__chunk_lock(): data pipeline read failed
    major: Dataset
    minor: Filter operation failed
  #003: /__w/libhdf5-wasm/libhdf5-wasm/build/1.14.2/_deps/hdf5-src/src/H5Z.c line 1356 in H5Z_pipeline(): required filter 'SZ3 compressor/decompressor for floating-point data.' is not registered
    major: Data filters
    minor: Read failed
`;

describe('parseDiagnostics', () => {
  it('should parse HDF5 error message and return diagnostics', () => {
    const diagnostics = parseDiagnostics(HDF5_ERROR_MESSAGE);
    expect(diagnostics).toEqual([
      {
        major: 'Dataset',
        minor: 'Read failed',
        message: "Can't synchronously read data",
        origin:
          '/__w/libhdf5-wasm/libhdf5-wasm/build/1.14.2/_deps/hdf5-src/src/H5D.c line 1061 in H5Dread()',
      },
      {
        major: 'Virtual Object Layer',
        minor: 'Read failed',
        message: 'Dataset read failed',
        origin:
          '/__w/libhdf5-wasm/libhdf5-wasm/build/1.14.2/_deps/hdf5-src/src/H5VLcallback.c line 2092 in H5VL_dataset_read_direct()',
      },
      {
        major: 'Dataset',
        minor: 'Filter operation failed',
        message: 'Data pipeline read failed',
        origin:
          '/__w/libhdf5-wasm/libhdf5-wasm/build/1.14.2/_deps/hdf5-src/src/H5Dchunk.c line 4468 in H5D__chunk_lock()',
      },
      {
        major: 'Data filters',
        minor: 'Read failed',
        message:
          "Required filter 'SZ3 compressor/decompressor for floating-point data.' is not registered",
        origin:
          '/__w/libhdf5-wasm/libhdf5-wasm/build/1.14.2/_deps/hdf5-src/src/H5Z.c line 1356 in H5Z_pipeline()',
      },
    ]);
  });
});

describe('resolveUrl', () => {
  it('resolve relative URL against base URL', () => {
    expect(resolveUrl('foo.h5', 'https://example.com/data/')).toBe(
      'https://example.com/data/foo.h5',
    );
    expect(resolveUrl('/foo.h5', 'https://example.com/data/')).toBe(
      'https://example.com/foo.h5',
    );
    expect(resolveUrl('https://other.org/foo.h5', 'https://example.com/')).toBe(
      'https://other.org/foo.h5',
    );
  });

  it('return invalid URL as is', () => {
    expect(resolveUrl('http://', 'https://example.com/')).toBe('http://');
  });
});

describe('getFilenameFromUrl', () => {
  it('return last segment of URL path', () => {
    expect(getFilenameFromUrl('https://example.com/data/foo.h5?v=1')).toBe(
      'foo.h5',
    );
    expect(getFilenameFromUrl('https://example.com/my%20file.h5')).toBe(
      'my file.h5',
    );
    expect(getFilenameFromUrl('https://example.com/data/')).toBe('data');
  });

  it('handle edge cases', () => {
    expect(getFilenameFromUrl('https://example.com/100%.h5')).toBe('100%.h5');
    expect(getFilenameFromUrl('https://example.com/')).toBe('example.com');
    expect(getFilenameFromUrl('not a url')).toBe('not a url');
  });
});
