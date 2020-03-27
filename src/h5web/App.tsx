import React, { useState, useEffect } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import Explorer from './explorer/Explorer';
import DatasetVisualizer from './dataset-visualizer/DatasetVisualizer';
import { HDF5Link, HDF5Dataset } from './providers/models';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import { isDataset } from './providers/utils';
import { useEntity } from './providers/hooks';
import EmptyVisualizer from './dataset-visualizer/EmptyVisualizer';

function App(): JSX.Element {
  const [selectedLink, setSelectedLink] = useState<HDF5Link>();
  const [selectedDataset, setSelectedDataset] = useState<HDF5Dataset>();

  const selectedEntity = useEntity(selectedLink);

  useEffect(() => {
    if (selectedEntity && isDataset(selectedEntity)) {
      setSelectedDataset(selectedEntity);
    } else {
      setSelectedDataset(undefined);
    }
  }, [selectedEntity]);

  return (
    <div className={styles.app}>
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement className={styles.explorer} flex={0.25} minSize={250}>
          <Explorer onSelect={setSelectedLink} />
        </ReflexElement>

        <ReflexSplitter />

        <ReflexElement minSize={500}>
          <ReflexContainer orientation="horizontal">
            <ReflexElement className={styles.dataVisualizer} minSize={250}>
              {selectedDataset ? (
                <DatasetVisualizer
                  key={JSON.stringify(selectedDataset)}
                  dataset={selectedDataset}
                />
              ) : (
                <EmptyVisualizer />
              )}
            </ReflexElement>

            <ReflexSplitter />

            <ReflexElement
              className={styles.metadataViewer}
              flex={0.25}
              minSize={100}
            >
              {selectedLink ? (
                <MetadataViewer
                  key={JSON.stringify(selectedLink)}
                  link={selectedLink}
                  entity={selectedEntity}
                />
              ) : (
                <div className={styles.empty}>
                  <p>No entity selected.</p>
                </div>
              )}
            </ReflexElement>
          </ReflexContainer>
        </ReflexElement>
      </ReflexContainer>
    </div>
  );
}

export default App;
