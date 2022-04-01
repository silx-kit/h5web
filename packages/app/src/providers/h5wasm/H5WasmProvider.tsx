import type { File as H5WasmFile } from 'h5wasm';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import Provider from '../Provider';
import { H5WasmApi } from './h5wasm-api';
import { fetchSource, getFilePath } from './utils';

// H5WasmSourceType:
//  - string indicates URL to load over http
//  - File indicates an item from the FileList of an <input type="file">
//    (for uploading directly)
export type H5WasmSourceType = string | File;

interface Props {
  source: H5WasmSourceType;
  children: ReactNode;
}

function H5WasmProvider(props: Props) {
  const { source, children } = props;
  const [filePromise, setFilePromise] = useState<Promise<H5WasmFile>>();

  // Need to do cleanup if re-rendering:
  // - closing the existing H5WasmFile object
  // - deleting the backing file in the virtual filesystem (done in fetchSource)
  // but we don't want to update the filePromise on update of filePromise...
  // which is why we leave it out of the dependencies below and
  // need to disable the eslint trigger for that line.
  useEffect(() => {
    setFilePromise(fetchSource(source, filePromise));
  }, [source]); // eslint-disable-line react-hooks/exhaustive-deps

  const api = new H5WasmApi(
    filePromise as Promise<H5WasmFile>,
    getFilePath(source)
  );

  return <Provider api={api}>{children}</Provider>;
}

export default H5WasmProvider;
