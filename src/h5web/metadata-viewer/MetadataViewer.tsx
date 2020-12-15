import React, { ReactElement } from 'react';
import type { Entity } from '../providers/models';
import AttributesTable from './AttributesTable';
import EntityTable from './EntityTable';
import styles from './MetadataViewer.module.css';

interface Props {
  entity?: Entity;
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
      <EntityTable entity={entity} />
      <AttributesTable attributes={entity.attributes} />
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default React.memo(MetadataViewer);
