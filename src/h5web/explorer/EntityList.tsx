import { ReactElement, useContext } from 'react';
import styles from './Explorer.module.css';
import { ProviderContext } from '../providers/context';
import EntityItem from './EntityItem';

interface Props {
  level: number;
  parentPath: string;
  selectedPath: string;
  onSelect: (path: string) => void;
}

function EntityList(props: Props): ReactElement {
  const { level, parentPath, selectedPath, onSelect } = props;

  const { groupsStore } = useContext(ProviderContext);
  const entities = groupsStore.get(parentPath).children;

  if (entities.length === 0) {
    return <></>;
  }

  return (
    <ul className={styles.group} role="group">
      {entities.map((entity) => {
        const { uid, name } = entity;
        const path = `${parentPath === '/' ? '' : parentPath}/${name}`;

        return (
          <EntityItem
            key={uid}
            path={path}
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
