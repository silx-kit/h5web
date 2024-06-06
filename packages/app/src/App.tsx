import '@h5web/lib'; // make sure lib styles come first in CSS bundle

import { useToggle } from '@react-hookz/web';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';

import styles from './App.module.css';
import BreadcrumbsBar from './breadcrumbs/BreadcrumbsBar';
import type { FeedbackContext } from './breadcrumbs/models';
import EntityLoader from './EntityLoader';
import ErrorFallback from './ErrorFallback';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import { useDataContext } from './providers/DataProvider';
import Sidebar from './Sidebar';
import VisConfigProvider from './VisConfigProvider';
import Visualizer from './visualizer/Visualizer';

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
  const [isSidebarOpen, toggleSidebarOpen] = useToggle(initialSidebarOpen);
  const [isInspecting, setInspecting] = useState(false);

  const { valuesStore } = useDataContext();
  function onSelectPath(path: string) {
    setSelectedPath(path);
    valuesStore.abortAll('entity changed');
    valuesStore.evictErrors();
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(err) => {
        if (propagateErrors) {
          throw err;
        }
      }}
    >
      <ReflexContainer
        className={styles.root}
        data-fullscreen-root
        data-allow-dark-mode={disableDarkMode ? undefined : ''}
        orientation="vertical"
      >
        <ReflexElement
          className={styles.sidebarArea}
          style={{ display: isSidebarOpen ? undefined : 'none' }}
          flex={25}
          minSize={150}
        >
          <Sidebar selectedPath={selectedPath} onSelect={onSelectPath} />
        </ReflexElement>

        <ReflexSplitter
          className={styles.splitter}
          style={{ display: isSidebarOpen ? undefined : 'none' }}
        />

        <ReflexElement className={styles.mainArea} flex={75} minSize={500}>
          <BreadcrumbsBar
            path={selectedPath}
            isSidebarOpen={isSidebarOpen}
            isInspecting={isInspecting}
            onToggleSidebar={toggleSidebarOpen}
            onChangeInspecting={setInspecting}
            onSelectPath={onSelectPath}
            getFeedbackURL={getFeedbackURL}
          />
          <VisConfigProvider>
            <ErrorBoundary
              resetKeys={[selectedPath, isInspecting]}
              FallbackComponent={ErrorFallback}
            >
              <Suspense fallback={<EntityLoader isInspecting={isInspecting} />}>
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
          </VisConfigProvider>
        </ReflexElement>
      </ReflexContainer>
    </ErrorBoundary>
  );
}

export default App;
