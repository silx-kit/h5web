import { useState, ReactElement, useContext } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import Explorer from './explorer/Explorer';
import type { Entity } from './providers/models';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import BreadcrumbsBar from './BreadcrumbsBar';
import Visualizer from './visualizer/Visualizer';
import { getEntityAtPath } from './utils';
import { ProviderContext } from './providers/context';

function App(): ReactElement {
  const { metadata } = useContext(ProviderContext);

  const [selectedEntity, setSelectedEntity] = useState<Entity>();
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
        <Explorer
          onSelect={(path: string) => {
            setSelectedEntity(getEntityAtPath(metadata, path));
          }}
        />
      </ReflexElement>

      <ReflexSplitter
        style={{ display: isExplorerOpen ? undefined : 'none' }}
      />

      <ReflexElement className={styles.mainArea} flex={75} minSize={500}>
        <BreadcrumbsBar
          isExplorerOpen={isExplorerOpen}
          onToggleExplorer={() => setExplorerOpen(!isExplorerOpen)}
          isInspecting={isInspecting}
          onChangeInspecting={setInspecting}
          selectedEntity={selectedEntity}
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
