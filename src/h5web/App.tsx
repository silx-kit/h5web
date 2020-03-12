import React, { useState } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import Explorer from './explorer/Explorer';
import DatasetVisualizer from './dataset-visualizer/DatasetVisualizer';
import { HDF5Link, HDF5Collection, HDF5HardLink } from './providers/models';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import { isHardLink } from './providers/type-guards';

function App(): JSX.Element {
  const [selectedLink, setSelectedLink] = useState<HDF5Link>();
  const [selectedDataset, setSelectedDataset] = useState<HDF5HardLink>();

  return (
    <div className={styles.app}>
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement className={styles.explorer} flex={0.3} minSize={250}>
          <Explorer
            onSelect={link => {
              setSelectedLink(link);

              if (
                isHardLink(link) &&
                link.collection === HDF5Collection.Datasets
              ) {
                setSelectedDataset(link);
              }
            }}
          />
        </ReflexElement>

        <ReflexSplitter />

        <ReflexElement minSize={500}>
          <ReflexContainer orientation="horizontal">
            <ReflexElement minSize={250}>
              {selectedDataset ? (
                <DatasetVisualizer
                  key={JSON.stringify(selectedDataset)}
                  link={selectedDataset}
                />
              ) : (
                <div className={styles.empty}>
                  <p>No dataset selected.</p>
                </div>
              )}
            </ReflexElement>

            <ReflexSplitter />

            <ReflexElement
              className={styles.metadataViewer}
              flex={0.7}
              minSize={250}
            >
              {selectedLink ? (
                <MetadataViewer
                  key={JSON.stringify(selectedLink)}
                  link={selectedLink}
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
