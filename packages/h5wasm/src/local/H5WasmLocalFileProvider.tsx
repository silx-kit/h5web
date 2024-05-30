import type { DataProviderApi } from '@h5web/app';
import { DataProvider } from '@h5web/app';
import type { ViewerConfig } from '@h5web/app/src/providers/models';
import type { PropsWithChildren } from 'react';
import { useMemo, useRef } from 'react';

import type { Plugin } from '../models';
import { H5WasmLocalFileApi } from './h5wasm-local-file-api';

const DEFAULT_VIEWER_CONFIG: ViewerConfig = {
  slicingTiming: 20,
};

interface Props {
  file: File;
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
  viewerConfig?: Partial<ViewerConfig>;
}

function H5WasmLocalFileProvider(props: PropsWithChildren<Props>) {
  const { file, getExportURL, getPlugin, viewerConfig, children } = props;

  const prevApiRef = useRef<H5WasmLocalFileApi>();

  const api = useMemo(() => {
    const newApi = new H5WasmLocalFileApi(file, getExportURL, getPlugin);

    void prevApiRef.current?.cleanUp();
    prevApiRef.current = newApi;

    return newApi;
  }, [file, getExportURL, getPlugin]);

  const mergedViewerConfig = useMemo(
    () => ({ ...DEFAULT_VIEWER_CONFIG, ...viewerConfig }),
    [viewerConfig],
  );

  return (
    <DataProvider api={api} viewerConfig={mergedViewerConfig}>
      {children}
    </DataProvider>
  );
}

export default H5WasmLocalFileProvider;
