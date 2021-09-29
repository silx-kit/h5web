import { useState, Suspense } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import { assertAbsolutePath } from '@h5web/shared';
import Explorer from './explorer/Explorer';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import BreadcrumbsBar from './breadcrumbs/BreadcrumbsBar';
import VisPackChooser from './vis-packs/VisPackChooser';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './visualizer/ErrorFallback';
import LoadingFallback from './LoadingFallback';
import VisConfigProvider from './VisConfigProvider';

import 'react-reflex/styles.css';

const DEFAULT_PATH = process.env.REACT_APP_DEFAULT_PATH || '/';
assertAbsolutePath(DEFAULT_PATH);

function App() {
  const [selectedPath, setSelectedPath] = useState<string>(DEFAULT_PATH);
  const [isExplorerOpen, setExplorerOpen] = useState(true);
  const [isInspecting, setInspecting] = useState(false);

  return (
    <ReflexContainer className={styles.root} orientation="vertical">
      <ReflexElement
        className={styles.explorer}
        style={{ display: isExplorerOpen ? undefined : 'none' }}
        flex={25}
        minSize={150}
      >
        <Explorer selectedPath={selectedPath} onSelect={setSelectedPath} />
      </ReflexElement>

      <ReflexSplitter
        style={{ display: isExplorerOpen ? undefined : 'none' }}
      />

      <ReflexElement className={styles.mainArea} flex={75} minSize={500}>
        <BreadcrumbsBar
          path={selectedPath}
          isExplorerOpen={isExplorerOpen}
          isInspecting={isInspecting}
          onToggleExplorer={() => setExplorerOpen(!isExplorerOpen)}
          onChangeInspecting={setInspecting}
          onSelectPath={setSelectedPath}
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
                  onSelectPath={setSelectedPath}
                />
              ) : (
                <VisPackChooser path={selectedPath} />
              )}
            </Suspense>
          </ErrorBoundary>
        </VisConfigProvider>
      </ReflexElement>
    </ReflexContainer>
  );
}

export default App;
