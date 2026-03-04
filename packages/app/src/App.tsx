import '@h5web/lib'; // eslint-disable-line import/no-duplicates -- make sure lib styles come first in CSS bundle

import { KeepZoomProvider } from '@h5web/lib'; // eslint-disable-line import/no-duplicates
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelRef,
} from 'react-resizable-panels';

import styles from './App.module.css';
import BreadcrumbsBar from './breadcrumbs/BreadcrumbsBar';
import { type FeedbackContext } from './breadcrumbs/models';
import { DimMappingProvider } from './dim-mapping-store';
import EntityLoader from './EntityLoader';
import ErrorFallback from './ErrorFallback';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import { useDataContext } from './providers/DataProvider';
import Sidebar from './Sidebar';
import VisConfigProvider from './VisConfigProvider';
import Visualizer from './visualizer/Visualizer';

const SIDEBAR_ID = 'h5w-sidebar';
const MAIN_AREA_ID = 'h5w-main-area';
const RESIZE_TARGET_MIN_SIZE = { coarse: 6, fine: 6 }; // match CSS width (.splitter::before)

interface Props {
  sidebarOpen?: boolean;
  initialPath?: string;
  getFeedbackURL?: (context: FeedbackContext) => string;
  disableDarkMode?: boolean;
  propagateErrors?: boolean;
}

function App(props: Props) {
  const {
    sidebarOpen: initialSidebarOpen = true,
    initialPath = '/',
    getFeedbackURL,
    disableDarkMode,
    propagateErrors,
  } = props;

  const [selectedPath, setSelectedPath] = useState<string>(initialPath);
  const [isInspecting, setInspecting] = useState(false);

  const { valuesStore } = useDataContext();
  function onSelectPath(path: string) {
    setSelectedPath(path);
    valuesStore.abortAll('entity changed', true);
  }

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'h5web:layout',
  });

  const sidebarPanelRef = usePanelRef();
  const [isSidebarOpen, setSidebarOpen] = useState(
    initialSidebarOpen
      ? !defaultLayout || defaultLayout[SIDEBAR_ID] > 0
      : false,
  );

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(err) => {
        if (propagateErrors) {
          throw err;
        }
      }}
    >
      <Group
        className={styles.root}
        resizeTargetMinimumSize={RESIZE_TARGET_MIN_SIZE}
        defaultLayout={initialSidebarOpen ? defaultLayout : undefined}
        onLayoutChanged={onLayoutChanged}
        data-fullscreen-root
        data-allow-dark-mode={disableDarkMode ? undefined : ''}
      >
        <Panel
          id={SIDEBAR_ID}
          className={styles.sidebarArea}
          panelRef={sidebarPanelRef}
          defaultSize={initialSidebarOpen ? '25%' : '0%'}
          minSize={150}
          collapsible
          onResize={({ inPixels: size }) => {
            const isNowOpen = size > 0;
            if (
              (isNowOpen && !isSidebarOpen) ||
              (!isNowOpen && isSidebarOpen)
            ) {
              setSidebarOpen(isNowOpen);
            }
          }}
        >
          <Sidebar selectedPath={selectedPath} onSelect={onSelectPath} />
        </Panel>

        <Separator className={styles.splitter} />

        <Panel id={MAIN_AREA_ID} className={styles.mainArea} minSize={500}>
          <BreadcrumbsBar
            path={selectedPath}
            isSidebarOpen={isSidebarOpen}
            isInspecting={isInspecting}
            onToggleSidebar={() => {
              if (isSidebarOpen) {
                sidebarPanelRef.current?.collapse();
              } else {
                sidebarPanelRef.current?.expand();
              }
            }}
            onChangeInspecting={setInspecting}
            onSelectPath={onSelectPath}
            getFeedbackURL={getFeedbackURL}
          />
          <VisConfigProvider>
            <DimMappingProvider>
              <KeepZoomProvider>
                <ErrorBoundary
                  resetKeys={[selectedPath, isInspecting]}
                  FallbackComponent={ErrorFallback}
                >
                  <Suspense
                    fallback={<EntityLoader isInspecting={isInspecting} />}
                  >
                    {isInspecting ? (
                      <MetadataViewer
                        path={selectedPath}
                        onSelectPath={onSelectPath}
                      />
                    ) : (
                      <Visualizer path={selectedPath} />
                    )}
                  </Suspense>
                </ErrorBoundary>
              </KeepZoomProvider>
            </DimMappingProvider>
          </VisConfigProvider>
        </Panel>
      </Group>
    </ErrorBoundary>
  );
}

export default App;
