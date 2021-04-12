import { useState, Suspense } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import Explorer from './explorer/Explorer';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import BreadcrumbsBar from './breadcrumbs/BreadcrumbsBar';
import VisPackChooser from './vis-packs/VisPackChooser';
import { assertAbsolutePath } from './guards';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorMessage from './visualizer/ErrorMessage';
import LoadingFallback from './LoadingFallback';

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
        minSize={250}
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
        <ErrorBoundary
          resetKeys={[selectedPath, isInspecting]}
          FallbackComponent={ErrorMessage}
        >
          <Suspense fallback={<LoadingFallback isInspecting={isInspecting} />}>
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
      </ReflexElement>
    </ReflexContainer>
  );
}

export default App;
