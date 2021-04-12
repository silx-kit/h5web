import { memo, useContext } from 'react';
import { isAbsolutePath } from '../guards';
import { ProviderContext } from '../providers/context';
import { buildEntityPath } from '../utils';
import AttributesTable from './AttributesTable';
import EntityTable from './EntityTable';
import styles from './MetadataViewer.module.css';

interface Props {
  path: string;
  onSelectPath: (path: string) => void;
}

function MetadataViewer(props: Props) {
  const { path, onSelectPath } = props;

  const { entitiesStore } = useContext(ProviderContext);
  const entity = entitiesStore.get(path);

  return (
    <div className={styles.metadataViewer}>
      <EntityTable entity={entity} />
      <AttributesTable
        attributes={entity.attributes}
        onFollowPath={(pathToFollow) => {
          const absolutePath = isAbsolutePath(pathToFollow)
            ? pathToFollow
            : buildEntityPath(path, pathToFollow);

          onSelectPath(absolutePath);
        }}
      />
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default memo(MetadataViewer);
