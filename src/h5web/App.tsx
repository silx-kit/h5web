import React, { useState, useEffect } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import Explorer from './explorer/Explorer';
import DatasetVisualizer from './dataset-visualizer/DatasetVisualizer';
import { HDF5Link, HDF5Dataset } from './providers/models';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import { isDataset } from './providers/utils';
import { useEntity } from './providers/hooks';

enum Role {
  Inspect,
  Display,
}

function App(): JSX.Element {
  const [selectedLink, setSelectedLink] = useState<HDF5Link>();
  const [selectedDataset, setSelectedDataset] = useState<HDF5Dataset>();
  const [role, setRole] = useState<Role>(Role.Display);

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

        <ReflexElement className={styles.mainArea} minSize={500}>
          <div className={styles.toolbar}>
            {' '}
            <div className={styles.roleToggler}>
              <button
                type="button"
                role="tab"
                className={styles.btn}
                aria-selected={role === Role.Display}
                onClick={() => {
                  setRole(Role.Display);
                }}
              >
                Display
              </button>
              <button
                type="button"
                role="tab"
                className={styles.btn}
                aria-selected={role === Role.Inspect}
                onClick={() => {
                  setRole(Role.Inspect);
                }}
              >
                Inspect
              </button>
            </div>
          </div>
          {role === Role.Display ? (
            <DatasetVisualizer dataset={selectedDataset} />
          ) : (
            <MetadataViewer
              key={JSON.stringify(selectedLink)}
              link={selectedLink}
              entity={selectedEntity}
            />
          )}
        </ReflexElement>
      </ReflexContainer>
    </div>
  );
}

export default App;
