import { Suspense, useContext, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';

import styles from './App.module.css';
import ErrorFallback from './ErrorFallback';
import LoadingFallback from './LoadingFallback';
import VisConfigProvider from './VisConfigProvider';
import BreadcrumbsBar from './breadcrumbs/BreadcrumbsBar';
import type { FeedbackContext } from './breadcrumbs/models';
import Explorer from './explorer/Explorer';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import { ProviderContext } from './providers/context';
import Visualizer from './visualizer/Visualizer';

interface Props {
  startFullscreen?: boolean;
  initialPath?: string;
  getFeedbackURL?: (context: FeedbackContext) => string;
}

function App(props: Props) {
  const { startFullscreen, initialPath = '/', getFeedbackURL } = props;

  const [selectedPath, setSelectedPath] = useState<string>(initialPath);
  const [isExplorerOpen, setExplorerOpen] = useState(!startFullscreen);
  const [isInspecting, setInspecting] = useState(false);

  const { valuesStore } = useContext(ProviderContext);
  function onSelectPath(path: string) {
    setSelectedPath(path);
    valuesStore.cancelOngoing();
    valuesStore.evictCancelled();
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ReflexContainer className={styles.root} orientation="vertical">
        <ReflexElement
          className={styles.explorer}
          style={{ display: isExplorerOpen ? undefined : 'none' }}
          flex={25}
          minSize={150}
        >
          <Explorer selectedPath={selectedPath} onSelect={onSelectPath} />
        </ReflexElement>

        <ReflexSplitter
          className={styles.splitter}
          style={{ display: isExplorerOpen ? undefined : 'none' }}
        />

        <ReflexElement className={styles.mainArea} flex={75} minSize={500}>
          <BreadcrumbsBar
            path={selectedPath}
            isExplorerOpen={isExplorerOpen}
            isInspecting={isInspecting}
            onToggleExplorer={() => setExplorerOpen(!isExplorerOpen)}
            onChangeInspecting={setInspecting}
            onSelectPath={onSelectPath}
            getFeedbackURL={getFeedbackURL}
          />
          <VisConfigProvider>
            <ErrorBoundary
              resetKeys={[selectedPath, isInspecting]}
              FallbackComponent={ErrorFallback}
            >
              <Suspense
                fallback={<LoadingFallback isInspecting={isInspecting} />}
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
          </VisConfigProvider>
        </ReflexElement>
      </ReflexContainer>
    </ErrorBoundary>
  );
}

export default App;
