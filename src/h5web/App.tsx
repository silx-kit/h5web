import { useState, ReactElement, Suspense } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import Explorer from './explorer/Explorer';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import BreadcrumbsBar from './BreadcrumbsBar';
import VisPackChooser from './vis-packs/VisPackChooser';
import { assertAbsolutePath } from './guards';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorMessage from './visualizer/ErrorMessage';
import LoadingFallback from './LoadingFallback';

const DEFAULT_PATH = process.env.REACT_APP_DEFAULT_PATH || '/';
assertAbsolutePath(DEFAULT_PATH);

function App(): ReactElement {
  const [selectedPath, setSelectedPath] = useState<string>(DEFAULT_PATH);
  const [isExplorerOpen, setExplorerOpen] = useState(true);
  const [isInspecting, setInspecting] = useState(false);

  return (
    <ReflexContainer orientation="vertical">
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
        />
        <ErrorBoundary
          resetKeys={[selectedPath]}
          FallbackComponent={ErrorMessage}
        >
          <Suspense fallback={<LoadingFallback isInspecting={isInspecting} />}>
            {isInspecting ? (
              <MetadataViewer path={selectedPath} />
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
