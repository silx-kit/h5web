import { memo, useContext } from 'react';
import { ProviderContext } from '../providers/context';
import AttributesTable from './AttributesTable';
import EntityTable from './EntityTable';
import styles from './MetadataViewer.module.css';

interface Props {
  path: string;
}

function MetadataViewer(props: Props) {
  const { path } = props;

  const { entitiesStore } = useContext(ProviderContext);
  const entity = entitiesStore.get(path);

  return (
    <div className={styles.metadataViewer}>
      <EntityTable entity={entity} />
      <AttributesTable attributes={entity.attributes} />
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default memo(MetadataViewer);
