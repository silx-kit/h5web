import React, { useState, useContext, ReactElement } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import Explorer from './explorer/Explorer';
import type { HDF5Link } from './providers/models';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import type { TreeNode } from './explorer/models';
import BreadcrumbsBar from './BreadcrumbsBar';
import Visualizer from './visualizer/Visualizer';
import { getEntity } from './providers/utils';
import { ProviderContext } from './providers/context';

function App(): ReactElement {
  const { metadata } = useContext(ProviderContext);

  const [selectedNode, setSelectedNode] = useState<TreeNode<HDF5Link>>();
  const [isExplorerOpen, setExplorerOpen] = useState(true);
  const [isInspecting, setInspecting] = useState(false);

  const selectedLink = selectedNode?.data;
  const selectedEntity = getEntity(selectedLink, metadata);

  return (
    <div className={styles.app}>
      <ReflexContainer orientation="vertical">
        <ReflexElement
          className={styles.explorer}
          style={{ display: isExplorerOpen ? undefined : 'none' }}
          flex={25}
          minSize={250}
        >
          <Explorer selectedNode={selectedNode} onSelect={setSelectedNode} />
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
            selectedNode={selectedNode}
          />
          {isInspecting ? (
            <MetadataViewer
              key={JSON.stringify(selectedLink)}
              link={selectedLink}
              entity={selectedEntity}
            />
          ) : (
            <Visualizer entity={selectedEntity} />
          )}
        </ReflexElement>
      </ReflexContainer>
    </div>
  );
}

export default App;
