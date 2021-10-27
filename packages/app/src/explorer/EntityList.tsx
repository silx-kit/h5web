import {
  assertGroupWithChildren,
  buildEntityPath,
  handleError,
} from '@h5web/shared';
import { useContext } from 'react';

import { ProviderContext } from '../providers/context';
import { ProviderError } from '../providers/models';
import EntityItem from './EntityItem';
import styles from './Explorer.module.css';

interface Props {
  level: number;
  parentPath: string;
  selectedPath: string;
  onSelect: (path: string) => void;
}

function EntityList(props: Props) {
  const { level, parentPath, selectedPath, onSelect } = props;
  const { filepath, entitiesStore } = useContext(ProviderContext);

  const group = handleError(
    () => entitiesStore.get(parentPath),
    ProviderError.FileNotFound,
    `File not found: '${filepath}'`
  );

  assertGroupWithChildren(group);

  if (group.children.length === 0) {
    return null;
  }

  return (
    <ul className={styles.group} role="group">
      {group.children.map((entity) => {
        const { name } = entity;

        return (
          <EntityItem
            key={name}
            path={buildEntityPath(parentPath, name)}
            entity={entity}
            level={level}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        );
      })}
    </ul>
  );
}

export default EntityList;
