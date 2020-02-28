import React, { useState } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import mockMetadata from './mock/metadata.json';
import Explorer from './explorer/Explorer';
import DatasetVisualizer from './dataset-visualizer/DatasetVisualizer';
import { HDF5Metadata, HDF5Link, HDF5Collection } from './models/metadata';
import styles from './App.module.css';
import MetadataViewer from './metadata-viewer/MetadataViewer';

function App(): JSX.Element {
  const [selectedLink, setSelectedLink] = useState<HDF5Link>();
  const [lastSelectedDataset, setLastSelectedDataset] = useState<HDF5Link>();

  return (
    <div className={styles.app}>
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement className={styles.explorer} flex={0.3} minSize={250}>
          <Explorer
            filename="water_224.h5"
            metadata={mockMetadata as HDF5Metadata}
            onSelect={link => {
              setSelectedLink(link);

              if (link.collection === HDF5Collection.Datasets) {
                setLastSelectedDataset(link);
              }
            }}
          />
        </ReflexElement>

        <ReflexSplitter />

        <ReflexElement minSize={500}>
          <ReflexContainer orientation="horizontal">
            <ReflexElement minSize={250}>
              <DatasetVisualizer link={lastSelectedDataset} />
            </ReflexElement>

            <ReflexSplitter />

            <ReflexElement flex={0.7} minSize={250}>
              <MetadataViewer link={selectedLink} />
            </ReflexElement>
          </ReflexContainer>
        </ReflexElement>
      </ReflexContainer>
    </div>
  );
}

export default App;
