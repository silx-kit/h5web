import React, { useState } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import mockMetadata from './mock/metadata.json';
import Explorer from './explorer/Explorer';
import Viewer from './viewer/Viewer';
import { HDF5Metadata, HDF5Link } from './models/metadata';
import styles from './App.module.css';

function App(): JSX.Element {
  const [selectedEntity, setSelectedEntity] = useState<HDF5Link>();

  return (
    <div className={styles.app}>
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement className={styles.explorer} flex={0.3} minSize={250}>
          <Explorer
            filename="water_224.h5"
            metadata={mockMetadata as HDF5Metadata}
            onSelect={setSelectedEntity}
          />
        </ReflexElement>

        <ReflexSplitter />

        <ReflexElement>
          <Viewer entity={selectedEntity} />
        </ReflexElement>
      </ReflexContainer>
    </div>
  );
}

export default App;
