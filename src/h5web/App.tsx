import React, { useState, ReactElement } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import Explorer from './explorer/Explorer';
import type { MyHDF5Entity } from './providers/models';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import BreadcrumbsBar from './BreadcrumbsBar';
import Visualizer from './visualizer/Visualizer';

function App(): ReactElement {
  const [selectedEntity, setSelectedEntity] = useState<MyHDF5Entity>();
  const [isExplorerOpen, setExplorerOpen] = useState(true);
  const [isInspecting, setInspecting] = useState(false);

  return (
    <div className={styles.app}>
      <ReflexContainer orientation="vertical">
        <ReflexElement
          className={styles.explorer}
          style={{ display: isExplorerOpen ? undefined : 'none' }}
          flex={25}
          minSize={250}
        >
          <Explorer
            selectedEntity={selectedEntity}
            onSelect={setSelectedEntity}
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
    </div>
  );
}

export default App;
