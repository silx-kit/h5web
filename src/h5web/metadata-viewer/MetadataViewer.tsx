import React, { ReactElement } from 'react';
import type { MyHDF5Entity } from '../providers/models';
import AttributesInfo from './AttributesInfo';
import EntityInfo from './EntityInfo';
import styles from './MetadataViewer.module.css';

interface Props {
  entity?: MyHDF5Entity;
}

function MetadataViewer(props: Props): ReactElement {
  const { entity } = props;

  if (!entity) {
    return (
      <div className={styles.empty}>
        <p>No entity selected.</p>
      </div>
    );
  }

  return (
    <div className={styles.metadataViewer}>
      <EntityInfo entity={entity} />
      <AttributesInfo attributes={entity.attributes} />
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default React.memo(MetadataViewer);
