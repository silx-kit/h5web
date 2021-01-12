import { useState, ReactElement, useContext } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import Explorer from './explorer/Explorer';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import BreadcrumbsBar from './BreadcrumbsBar';
import Visualizer from './visualizer/Visualizer';
import { getEntityAtPath } from './utils';
import { ProviderContext } from './providers/context';

const DEFAULT_PATH = process.env.REACT_APP_DEFAULT_PATH || '/';

function App(): ReactElement {
  const [selectedPath, setSelectedPath] = useState<string>(DEFAULT_PATH);
  const [isExplorerOpen, setExplorerOpen] = useState(true);
  const [isInspecting, setInspecting] = useState(false);

  const { metadata } = useContext(ProviderContext);
  const selectedEntity = getEntityAtPath(metadata, selectedPath);

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
          entityPath={selectedPath}
          isExplorerOpen={isExplorerOpen}
          isInspecting={isInspecting}
          onToggleExplorer={() => setExplorerOpen(!isExplorerOpen)}
          onChangeInspecting={setInspecting}
        />
        {isInspecting ? (
          <MetadataViewer entity={selectedEntity} />
        ) : (
          <Visualizer entity={selectedEntity} />
        )}
      </ReflexElement>
    </ReflexContainer>
  );
}

export default App;
