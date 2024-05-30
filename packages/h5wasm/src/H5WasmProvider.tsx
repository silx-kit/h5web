import type { DataProviderApi } from '@h5web/app';
import { DataProvider } from '@h5web/app';
import type { ViewerConfig } from '@h5web/app/src/providers/models';
import type { PropsWithChildren } from 'react';
import { useMemo, useRef } from 'react';

import { H5WasmApi } from './h5wasm-api';
import type { Plugin } from './models';

const DEFAULT_VIEWER_CONFIG: ViewerConfig = {
  slicingTiming: 20,
};

interface Props {
  filename: string;
  buffer: ArrayBuffer;
  getExportURL?: DataProviderApi['getExportURL'];
  getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>;
  viewerConfig?: Partial<ViewerConfig>;
}

function H5WasmProvider(props: PropsWithChildren<Props>) {
  const { filename, buffer, getExportURL, getPlugin, viewerConfig, children } =
    props;

  const prevApiRef = useRef<H5WasmApi>();

  const api = useMemo(() => {
    const newApi = new H5WasmApi(filename, buffer, getExportURL, getPlugin);

    void prevApiRef.current?.cleanUp();
    prevApiRef.current = newApi;

    return newApi;
  }, [buffer, filename, getExportURL, getPlugin]);

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

export default H5WasmProvider;
